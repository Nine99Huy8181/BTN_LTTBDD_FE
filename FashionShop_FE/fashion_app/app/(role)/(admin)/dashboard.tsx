// app/(admin)/dashboard.tsx
import { dashboardService } from "@/services/dashboard.service";
import {
  BestSellingProduct,
  DashboardStats,
  RecentOrder,
  RecentReview,
  RevenueChart,
} from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import Toast from "react-native-toast-message";
// NOTE: `xlsx` was removed as a static import because Metro bundler
// failed when the package wasn't installed on some setups.
// We fallback to CSV export here which Excel can open. If you prefer
// a real .xlsx output, install the `xlsx` package in the project
// (`npm install xlsx` or `yarn add xlsx`) and we can switch back.

const { width } = Dimensions.get("window");
const CARD_PADDING = 16;
// Tính toán chiều rộng chart để không bị tràn lề khi nằm trong Card
const CHART_WIDTH = width - CARD_PADDING * 2 - 10;

type ChartPeriod = "daily" | "weekly" | "monthly" | "yearly";

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueChart, setRevenueChart] = useState<RevenueChart | null>(null);
  const [bestProducts, setBestProducts] = useState<BestSellingProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("daily");

  const loadDashboardData = async () => {
    try {
      const [statsData, chartData, products, orders, reviews] =
        await Promise.all([
          dashboardService.getStats(),
          dashboardService.getRevenueChart(),
          dashboardService.getBestSellingProducts(5),
          dashboardService.getRecentOrders(5),
          dashboardService.getRecentReviews(5),
        ]);

      setStats(statsData);
      setRevenueChart(chartData);
      setBestProducts(products);
      setRecentOrders(orders);
      setRecentReviews(reviews);
    } catch (error: any) {
      console.error("Load dashboard error:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: error.message || "Không thể tải dữ liệu dashboard",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const exportDashboardToExcel = async () => {
    if (!stats) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không có dữ liệu để xuất",
      });
      return;
    }

    setExporting(true);
    try {
      const rowsToCsv = (rows: any[], headers?: string[]) => {
        if (!rows || rows.length === 0) return "";
        const cols = headers ?? Object.keys(rows[0]);
        const escape = (v: any) => {
          if (v === null || v === undefined) return "";
          const s = String(v);
          if (s.includes(",") || s.includes("\n") || s.includes('"')) {
            return '"' + s.replace(/"/g, '""') + '"';
          }
          return s;
        };
        const lines = [cols.join(",")];
        for (const r of rows) {
          lines.push(cols.map((c) => escape(r[c])).join(","));
        }
        return lines.join("\n");
      };

      // Build sections
      const parts: string[] = [];

      // Stats
      const statsData = Object.entries(stats).map(([k, v]) => ({
        Key: k,
        Value: v,
      }));
      if (statsData.length) {
        parts.push("Stats");
        parts.push(rowsToCsv(statsData, ["Key", "Value"]));
      }

      // Revenue
      const revenueRows = (revenueChart?.[chartPeriod] || []).map((d) => ({
        Period: d.label,
        Revenue: d.revenue,
        Orders: d.orderCount,
      }));
      if (revenueRows.length) {
        parts.push("");
        parts.push(`Revenue_${chartPeriod}`);
        parts.push(rowsToCsv(revenueRows, ["Period", "Revenue", "Orders"]));
      }

      // Best products
      const bestRows = bestProducts.map((p) => ({
        ProductID: p.productId,
        Name: p.productName,
        Sold: p.totalSold,
        Revenue: p.totalRevenue,
      }));
      if (bestRows.length) {
        parts.push("");
        parts.push("BestProducts");
        parts.push(
          rowsToCsv(bestRows, ["ProductID", "Name", "Sold", "Revenue"])
        );
      }

      // Recent orders
      const orderRows = recentOrders.map((o) => ({
        OrderNo: o.orderNumber,
        Customer: o.customerName,
        Date: new Date(o.orderDate).toLocaleString(),
        Total: o.totalAmount,
        Status: o.status,
      }));
      if (orderRows.length) {
        parts.push("");
        parts.push("RecentOrders");
        parts.push(
          rowsToCsv(orderRows, [
            "OrderNo",
            "Customer",
            "Date",
            "Total",
            "Status",
          ])
        );
      }

      // Recent reviews
      const reviewRows = recentReviews.map((r) => ({
        Customer: r.customerName,
        Product: r.productName,
        Rating: r.rating,
        Comment: r.comment || "",
      }));
      if (reviewRows.length) {
        parts.push("");
        parts.push("RecentReviews");
        parts.push(
          rowsToCsv(reviewRows, ["Customer", "Product", "Rating", "Comment"])
        );
      }

      const csvContent = parts.join("\n\n");

      // SỬ DỤNG API MỚI CỦA EXPO SDK 54+
      const fileName = `admin-dashboard-export-${Date.now()}.csv`;

      // Tạo File object sử dụng API mới
      const file = new File(Paths.cache, fileName);

      // Ghi nội dung vào file
      await file.write(csvContent);

      // Kiểm tra xem file sharing có available không
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(file.uri, {
          mimeType: "text/csv",
          dialogTitle: "Xuất file Dashboard",
        });

        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "File đã được xuất",
        });
      } else {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: `File đã được lưu tại: ${file.uri}`,
        });
      }
    } catch (error) {
      console.error("Export error:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: error instanceof Error ? error.message : "Không thể xuất file",
      });
    } finally {
      setExporting(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  const getChartData = () => {
    if (!revenueChart) return { labels: [], datasets: [{ data: [0] }] };

    const data = revenueChart[chartPeriod] || [];

    // Giới hạn số điểm hiển thị
    const maxPoints =
      chartPeriod === "daily" ? 7 : chartPeriod === "weekly" ? 8 : 6;
    const displayData = data.slice(-maxPoints);

    return {
      labels: displayData.map((d) => d.label),
      datasets: [
        {
          data: displayData.map((d) => d.revenue),
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const getOrderChartData = () => {
    if (!revenueChart) return { labels: [], datasets: [{ data: [0] }] };

    const data = revenueChart[chartPeriod] || [];
    const maxPoints =
      chartPeriod === "daily" ? 7 : chartPeriod === "weekly" ? 8 : 6;
    const displayData = data.slice(-maxPoints);

    return {
      labels: displayData.map((d) => d.label),
      datasets: [
        {
          data: displayData.map((d) => d.orderCount),
        },
      ],
    };
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: "#f59e0b",
      CONFIRMED: "#3b82f6",
      SHIPPING: "#8b5cf6",
      DELIVERED: "#10b981",
      CANCELLED: "#ef4444",
    };
    return colors[status] || "#6b7280";
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={exportDashboardToExcel}
            disabled={exporting}
          >
            {exporting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.exportButtonText}>Xuất Excel</Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.titleLine} />
        <Text style={styles.headerSubtitle}>Tổng quan hệ thống</Text>
      </View>

      {/* Stats Cards Grid */}
      {stats && (
        <View style={styles.gridContainer}>
          {/* Revenue */}
          <View style={styles.gridRow}>
            <StatCard
              icon="trending-up"
              label="Doanh thu hôm nay"
              value={formatCurrency(stats.todayRevenue)}
              color="#10b981"
            />
            <StatCard
              icon="wallet"
              label="Doanh thu tháng"
              value={formatCurrency(stats.monthRevenue)}
              color="#3b82f6"
            />
          </View>

          <View style={styles.gridRow}>
            <StatCard
              icon="calendar"
              label="Doanh thu năm"
              value={formatCurrency(stats.yearRevenue)}
              color="#8b5cf6"
            />
            <StatCard
              icon="cash"
              label="Tổng doanh thu"
              value={formatCurrency(stats.totalRevenue)}
              color="#f59e0b"
            />
          </View>

          {/* Orders */}
          <View style={styles.gridRow}>
            <StatCard
              icon="cart"
              label="Đơn hàng hôm nay"
              value={formatNumber(stats.newOrdersToday)}
              color="#ef4444"
            />
            <StatCard
              icon="time"
              label="Đơn chờ xử lý"
              value={formatNumber(stats.pendingOrders)}
              color="#f59e0b"
            />
          </View>

          <View style={styles.gridRow}>
            <StatCard
              icon="checkmark-circle"
              label="Đơn hoàn thành"
              value={formatNumber(stats.completedOrders)}
              color="#10b981"
            />
            <StatCard
              icon="bag-check"
              label="Tổng đơn hàng"
              value={formatNumber(stats.totalOrders)}
              color="#3b82f6"
            />
          </View>

          {/* Products/Customers */}
          <View style={styles.gridRow}>
            <StatCard
              icon="cube"
              label="Tổng sản phẩm"
              value={formatNumber(stats.totalProducts)}
              color="#8b5cf6"
            />
            <StatCard
              icon="alert-circle"
              label="Sắp hết hàng"
              value={formatNumber(stats.lowStockProducts)}
              color="#ef4444"
            />
          </View>

          <View style={styles.gridRow}>
            <StatCard
              icon="people"
              label="Tổng khách hàng"
              value={formatNumber(stats.totalCustomers)}
              color="#3b82f6"
            />
            <StatCard
              icon="person-add"
              label="KH mới tháng này"
              value={formatNumber(stats.newCustomersThisMonth)}
              color="#10b981"
            />
          </View>

          {/* Average */}
          <View style={styles.gridRow}>
            <StatCard
              icon="cash-outline"
              label="Giá trị ĐH TB"
              value={formatCurrency(stats.averageOrderValue)}
              color="#f59e0b"
            />
            <StatCard
              icon="star"
              label="Đánh giá TB"
              value={stats.averageRating?.toFixed(1) || "0.0"}
              color="#facc15"
            />
          </View>
        </View>
      )}

      {/* Revenue Chart */}
      {revenueChart && (
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Biểu đồ doanh thu</Text>
          </View>

          {/* Filter Pills */}
          <View style={styles.periodContainer}>
            {(["daily", "weekly", "monthly", "yearly"] as ChartPeriod[]).map(
              (period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.periodButton,
                    chartPeriod === period && styles.periodButtonActive,
                  ]}
                  onPress={() => setChartPeriod(period)}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      chartPeriod === period && styles.periodButtonTextActive,
                    ]}
                  >
                    {period === "daily"
                      ? "Ngày"
                      : period === "weekly"
                        ? "Tuần"
                        : period === "monthly"
                          ? "Tháng"
                          : "Năm"}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={getChartData()}
              width={Math.max(CHART_WIDTH, getChartData().labels.length * 60)}
              height={220}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: {
                  r: "5",
                  strokeWidth: "2",
                  stroke: "#3b82f6",
                },
              }}
              bezier
              style={styles.chart}
            />
          </ScrollView>

          <View style={styles.divider} />

          <Text style={[styles.cardTitle, { marginTop: 10, fontSize: 16 }]}>
            Số lượng đơn hàng
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={getOrderChartData()}
              width={Math.max(
                CHART_WIDTH,
                getOrderChartData().labels.length * 60
              )}
              height={200}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              style={styles.chart}
            />
          </ScrollView>
        </View>
      )}

      {/* Best Selling Products */}
      {bestProducts.length > 0 && (
        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>Sản phẩm bán chạy</Text>
          <View style={styles.listContainer}>
            {bestProducts.map((product) => (
              <View key={product.productId} style={styles.itemRow}>
                <Image
                  source={{ uri: product.imageUrl }}
                  style={styles.productImage}
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {product.productName}
                  </Text>
                  <View style={styles.rowBetween}>
                    <Text style={styles.itemSubText}>
                      Đã bán: {formatNumber(product.totalSold)}
                    </Text>
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={10} color="#facc15" />
                      <Text style={styles.ratingText}>
                        {product.averageRating?.toFixed(1) || "0.0"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.highlightText}>
                    {formatCurrency(product.totalRevenue)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>Đơn hàng mới</Text>
          <View style={styles.listContainer}>
            {recentOrders.map((order) => (
              <View key={order.orderId} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(order.status) },
                      ]}
                    >
                      <Text style={styles.statusText}>{order.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.itemSubText}>{order.customerName}</Text>
                  <Text style={styles.dateText}>
                    {new Date(order.orderDate).toLocaleDateString("vi-VN")}
                  </Text>
                </View>
                <View style={{ justifyContent: "center", paddingLeft: 10 }}>
                  <Text style={styles.highlightText}>
                    {formatCurrency(order.totalAmount)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Recent Reviews */}
      {recentReviews.length > 0 && (
        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>Đánh giá mới</Text>
          <View style={styles.listContainer}>
            {recentReviews.map((review) => (
              <View key={review.reviewId} style={styles.itemRow}>
                <Image
                  source={{ uri: review.productImage }}
                  style={styles.reviewImage}
                />
                <View style={styles.itemInfo}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {review.customerName}
                    </Text>
                    <View style={styles.rowCenter}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= review.rating ? "star" : "star-outline"}
                          size={12}
                          color="#facc15"
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.productRefText} numberOfLines={1}>
                    SP: {review.productName}
                  </Text>
                  {review.comment && (
                    <Text style={styles.commentText} numberOfLines={2}>
                      "{review.comment}"
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statLabel} numberOfLines={1}>
          {label}
        </Text>
        <Text style={[styles.statValue, { color: "#111" }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // Nền trắng
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },

  // HEADER
  header: {
    marginTop: 50,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exportButton: {
    backgroundColor: "#000",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  exportButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111",
  },
  titleLine: {
    width: 60,
    height: 4,
    backgroundColor: "#000",
    borderRadius: 2,
    marginTop: 5,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#666",
  },

  // GRID STATS
  gridContainer: {
    marginBottom: 10,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700",
  },

  // SECTION CARD (Wrapper cho Chart, Lists)
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: CARD_PADDING,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  cardHeader: {
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 12,
  },

  // FILTERS (Pill style)
  periodContainer: {
    flexDirection: "row",
    marginBottom: 10,
    flexWrap: "wrap",
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  periodButtonActive: {
    backgroundColor: "#000",
  },
  periodButtonText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  periodButtonTextActive: {
    color: "#fff",
  },

  // CHARTS
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 15,
  },

  // LISTS & ITEMS
  listContainer: {
    gap: 12,
  },
  itemRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f9f9f9",
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    marginRight: 12,
  },
  reviewImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  itemSubText: {
    fontSize: 12,
    color: "#777",
  },
  highlightText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10b981", // Green
    marginTop: 2,
  },

  // Helper styles
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
  },

  // Badges
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffde7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fbc02d",
    marginLeft: 2,
  },

  // Specific Text Styles
  orderNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
    textTransform: "uppercase",
  },
  dateText: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  },
  productRefText: {
    fontSize: 11,
    color: "#888",
    fontStyle: "italic",
    marginBottom: 2,
  },
  commentText: {
    fontSize: 13,
    color: "#444",
  },
});
