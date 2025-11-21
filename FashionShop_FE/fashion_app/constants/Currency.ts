/**
 * Định dạng số tiền theo chuẩn VND
 * @param amount - Số tiền cần định dạng
 * @returns Chuỗi số tiền đã được định dạng với dấu chấm ngăn cách hàng nghìn
 * @example
 * formatCurrency(500000) // "500.000"
 * formatCurrency(100000000) // "100.000.000"
 * formatCurrency(1234567) // "1.234.567"
 */
export const formatCurrency = (amount: number): string => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

/**
 * Định dạng số tiền theo chuẩn VND với đơn vị ₫
 * @param amount - Số tiền cần định dạng
 * @returns Chuỗi số tiền đã được định dạng với dấu chấm ngăn cách hàng nghìn và ký hiệu ₫
 * @example
 * formatCurrencyVND(500000) // "500.000 ₫"
 * formatCurrencyVND(100000000) // "100.000.000 ₫"
 */
export const formatCurrencyVND = (amount: number): string => {
    return `${formatCurrency(amount)} ₫`;
};

/**
 * Chuyển đổi chuỗi tiền đã định dạng về số
 * @param formattedAmount - Chuỗi số tiền đã được định dạng
 * @returns Số tiền dạng number
 * @example
 * parseCurrency("500.000") // 500000
 * parseCurrency("100.000.000") // 100000000
 */
export const parseCurrency = (formattedAmount: string): number => {
    return parseInt(formattedAmount.replace(/\./g, ""), 10);
};
