const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { auth, managerAuth } = require('../middleware/auth');

// @route   POST /api/tasks
// @desc    Create a new task (Admins/Managers can assign to anyone, Employees can only self-assign)
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { clientName, location, taskType, priority, dueDate, assignedTo } = req.body;

        const role = req.user.role.toLowerCase();
        let finalAssignedTo = assignedTo;

        if (role === 'employee') {
            // Employees can ONLY assign tasks to themselves
            finalAssignedTo = req.user._id;
        } else {
            // Admins/Managers can assign to anyone, fallback to themselves if omitted
            finalAssignedTo = assignedTo || req.user._id;
        }

        const newTask = new Task({
            clientName,
            location,
            taskType,
            priority,
            dueDate,
            assignedTo: finalAssignedTo,
            assignedBy: req.user._id
        });

        const savedTask = await newTask.save();
        await savedTask.populate('assignedTo', 'name role employeeId');
        await savedTask.populate('assignedBy', 'name');
        res.status(201).json(savedTask);
    } catch (err) {
        console.error('Error assigning task:', err);
        res.status(500).json({ message: err.message, stack: err.stack });
    }
});

// @route   GET /api/tasks
// @desc    Get all tasks (Admin) or just assigned tasks (Employee)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Admins and Managers see everything. Employees only see their own.
        const filter = (req.user.role === 'admin' || req.user.role === 'manager') ? {} : { assignedTo: req.user._id };

        const tasks = await Task.find(filter)
            .populate('assignedTo', 'name role employeeId')
            .populate('assignedBy', 'name')
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ message: 'Server error fetching tasks' });
    }
});

// @route   PUT /api/tasks/:id/status
// @desc    Update a task's status / add notes and time logs
// @access  Private
router.put('/:id/status', auth, async (req, res) => {
    try {
        const { status, timeElapsed, notes, inspectionChecklist, locationData } = req.body;

        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        // Access Control: Only the assigned employee OR an admin/manager can update status
        const isOwner = task.assignedTo.toString() === req.user._id.toString();
        const isLeader = req.user.role === 'admin' || req.user.role === 'manager';

        if (!isOwner && !isLeader) {
            return res.status(403).json({ message: 'Inadequate clearance for task modification.' });
        }

        // Timer Start Logic
        if (status === 'In Progress' && task.status !== 'In Progress') {
            task.lastStartTime = new Date();
            if (locationData) {
                task.startLocation = locationData;
            }
        }

        // Timer Stop Logic (transitioning OUT of In Progress or manual stop)
        if (task.status === 'In Progress' && (status && status !== 'In Progress')) {
            if (task.lastStartTime) {
                const now = new Date();
                const diffMs = now - task.lastStartTime;
                const diffMins = Math.round(diffMs / 60000);
                task.timeElapsed = (task.timeElapsed || 0) + diffMins;
                task.lastStartTime = undefined; // Reset
            }
            if (locationData) {
                task.endLocation = locationData;
            }
        }

        // Update other fields if provided
        if (status) task.status = status;
        if (timeElapsed !== undefined) task.timeElapsed = (task.timeElapsed || 0) + timeElapsed;
        if (notes) task.notes = notes;
        if (inspectionChecklist) task.inspectionChecklist = inspectionChecklist;

        const updatedTask = await task.save();

        // Populate before returning for the frontend
        await updatedTask.populate('assignedTo', 'name role employeeId');

        res.json(updatedTask);
    } catch (err) {
        console.error('Error updating task:', err);
        res.status(500).json({ message: 'Server error updating task' });
    }
});

module.exports = router;
