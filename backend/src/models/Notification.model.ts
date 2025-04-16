import mongoose, { Schema, Model } from "mongoose";
import { INotification } from "~/shared/interface";

//TODO: Add type for notification type (order, restaurant, etc.)
const NotificationSchema: Schema = new Schema(
    {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, },
        title: { type: String, required: true, },
        content: { type: String },
        url: { type: String, },
        is_read: { type: Boolean, default: false, },
    },
    { timestamps: true }
);

const Notification: Model<INotification> = mongoose.model<INotification>("Notification", NotificationSchema);
export default Notification;
