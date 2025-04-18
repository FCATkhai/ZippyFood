import mongoose, {Schema, Model} from 'mongoose';
import { IAdminReport } from '~/shared/interface';

const AdminReportSchema = new Schema<IAdminReport>({
    period: { type: String, enum: ['daily', 'monthly'], required: true },
    report_date: { type: Date, required: true },
    total_orders: { type: Number, default: 0 },
    total_revenue: { type: Number, default: 0 },
    top_products: [{
        product_id: { type: Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String },
        totalSold: { type: Number },
        restaurant_id: { type: Schema.Types.ObjectId, ref: 'Restaurant' }
    }],
    total_users: { type: Number, default: 0, sparse: true },
    total_restaurants: { type: Number, default: 0, sparse: true }
}, { timestamps: true });

AdminReportSchema.index({ period: 1, report_date: 1 });
const AdminReport: Model<IAdminReport> = mongoose.model<IAdminReport>('AdminReport', AdminReportSchema);
export default AdminReport;