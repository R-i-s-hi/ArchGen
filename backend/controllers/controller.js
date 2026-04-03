import Project from "../models/model.js";


export const getProjects = async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json({ success: true, data: projects });
    } catch (err) {
        res.json({ success: false, error: "Failed to fetch projects" });
    }
};

export const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        res.json({ success: true, data: project });
    } catch (err) {
        res.json({ success: false, error: "Failed to fetch project" });
    }
}