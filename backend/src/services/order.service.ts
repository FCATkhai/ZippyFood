import { Types } from 'mongoose';
import Order from '../models/Order.model'; 
import { USER_ROLES } from '../config/constants';
import { IOrder } from '~/shared/interface'; 
import { OrderStatus } from '~/shared/constant';

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
        await order.save();

        

        return order;
    }
}

export default new OrderService();