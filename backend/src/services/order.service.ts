import { Types } from 'mongoose';
import Order from '../models/Order.model'; 
import { USER_ROLES } from '../config/constants';
import { IOrder } from '~/shared/interface'; 
import { ORDER_STATUSES, OrderStatus } from '~/shared/constant';
import Product from '../models/Product.model';
class OrderService {
    /**
     * Cập nhật trạng thái đơn hàng
     * @param orderId ID của đơn hàng
     * @param status Trạng thái mới
     * @param userId ID của người dùng
     * @param userRole Vai trò của người dùng
     * @returns Đơn hàng đã được cập nhật
     */
    async updateOrderStatus(
        orderId: Types.ObjectId,
        status: OrderStatus,
        userId: Types.ObjectId,
        userRole: string
    ): Promise<IOrder> {
        // Find order
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Không tìm thấy đơn hàng');
        }

        // Check authorization
        if (
            order.customer_id.toString() !== userId.toString() &&
            userRole !== USER_ROLES.ADMIN &&
            userRole !== USER_ROLES.RESTAURANT_OWNER
        ) {
            throw new Error('Bạn không có quyền cập nhật đơn hàng này');
        }
        // Update status
        order.status = status as IOrder['status'];
        if (status === ORDER_STATUSES.COMPLETED) {
            order.completed_at = new Date();
            //TODO: Change to use service later
            const updatePromises = order.products.map(async (product) => {
                const foundProduct = await Product.findById(product.product_id);
                if (foundProduct) {
                    foundProduct.sales_count += product.quantity;
                    return foundProduct.save(); // Trả về Promise
                }
            });
            const validPromises = updatePromises.filter(p => p !== undefined);
            await Promise.all(validPromises); // consider Promise.allSettle()
        }
        await order.save();
        return order;
    }
}

export default new OrderService();