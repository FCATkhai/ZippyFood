import mongoose, {Schema, Model} from 'mongoose';
import { IMerchantReport } from '~/shared/interface';

const MerchantReportSchema = new Schema<IMerchantReport>({
    restaurant_id: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    period: { type: String, enum: ['daily', 'monthly'], required: true },
    report_date: { type: Date, required: true },
    completed_orders: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    top_products: [{
        product_id: { type: Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String },
        totalSold: { type: Number }
    }]
}, { timestamps: true });

MerchantReportSchema.index({ restaurant_id: 1, period: 1, report_date: 1 });
const MerchantReport: Model<IMerchantReport> = mongoose.model<IMerchantReport>('MerchantReport', MerchantReportSchema);
export default MerchantReport;