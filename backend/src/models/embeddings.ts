import type { InferSchemaType } from 'mongoose'
import { model, Schema, Types } from 'mongoose'

const itemEmbeddingSchema = new Schema({
    itemId: { type: Types.ObjectId, required: true, ref: 'items', unique: true },
    embedding: { type: [Number], required: true },
    metadata: {
        modelName: { type: String, default: 'open_clip:ViT-g-14' },
        sourceFields: [{ type: String }], // e.g., ['title', 'description', 'category', 'image']
        generatedAt: { type: Date, default: Date.now }
    }
}, { timestamps: true })

itemEmbeddingSchema.index({ itemId: 1 })

export type ItemEmbedding = InferSchemaType<typeof itemEmbeddingSchema>
export const ItemEmbeddingModel = model('item_embeddings', itemEmbeddingSchema)
