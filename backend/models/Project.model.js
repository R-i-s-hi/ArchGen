import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
    {
        ownerId: {
            type: String,
            required: true
        },
        prompt: {
            type: String,
            required: true
        },
        tech_stack: {
            type: Object,
            required: true
        },
        folder_structure: {
            frontend: {
                type: [String],
                default: []
            },
            backend: {
                type: [String],
                default: []
            }
        },
        database_schema: {
            type: Object,
            default: {}
        },
        api_routes: {
            type: [
                {
                    path: String,
                    method: String,
                    description: String
                }
            ],
            default: []
        },
        feature_roadmap: {
            type: [
                {
                    name: String,
                    description: String,
                    status: String
                }
            ],
            default: []
        },
        project_estimation: {
            complexity: {
                type: Number,
                min: 1,
                max: 5,
                default: 3
            },
            estimated_time: {
                type: String,
                default: ""
            },
            estimated_team: {
                type: [String],
                default: []
            },
            estimated_cost: {
                type: String,
                default: ""
            },
            cost_basis: {
                type: String,
                default: ""
            },
            performance: {
                type: Number,
                min: 1,
                max: 5,
                default: 3
            },
            maintainability: {
                type: Number,
                min: 1,
                max: 5,
                default: 3
            },
            security: {
                type: Number,
                min: 1,
                max: 5,
                default: 3
            },
            scalability: {
                type: Number,
                min: 1,
                max: 5,
                default: 3
            }
        },
        explanation: [
            {
                title: {
                    type: String,
                    default: ""
                },
                reason: {
                    type: String,
                    default: ""
                }
            }
        ],
        diagram: {
            type: String,
            default: null,
        },
        expireAt: {
            type: Date,
            default: null
        },
        title: {
            type: String,
            default: "Untitled Project"
        },
        pinned: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

ProjectSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Project", ProjectSchema);