const express = require('express')
const router = express.Router();
const Project = require("../models/Project.model")
const User = require('../models/User.model')
const {
    Types
} = require('mongoose')
const compareAsc = require('date-fns/compareAsc');
const isLoggedIn = require('../middleware/isLoggedIn');
const Chat = require('../models/Chat.model');
const Message = require('../models/Message.model');
const createError = require("http-errors");

// all projects page
router.get("/", async (req, res, next) => {
    try {
        const result = await Project.find().populate("initiator")
        return res.status(200).json(result)
    } catch (err) {
        next(err)
    }
})

// get project form
router.get("/create", isLoggedIn, async (req, res, next) => {
    try {
        const {
            userId
        } = req.query
        const user = await User.findById(userId)
        const {
            country,
            city
        } = user
        return res.status(200).json({
            country,
            city
        })
    } catch (err) {
        next(err)
    }
})

// Add new project
router.post("/create", isLoggedIn, async (req, res, next) => {
    // console.log("REQ: ", req.body)
    const {
        title,
        shortDescription,
        longDescription,
        lookingFor,
        startDate,
        endDate,
        isRemote,
        city,
        country
    } = req.body
    const user = Types.ObjectId(req.user)

    // Validation: title, shortDescription and longDescription are provided
    if (!title || !shortDescription || !longDescription) {
        res.status(400).json({
            message: "Please provide a title and description."
        });
        return;
    }

    // Validation: at least one skill added
    if (lookingFor.length === 0) {
        res.status(400).json({
            message: "Please select at least one skill you are looking for."
        });
        return;
    }

    // Validation: start not after end of project
    const dateValidation = compareAsc(new Date(startDate), new Date(endDate)) // Compare the two dates and return 1 if the first date is after the second, -1 if the first date is before the second or 0 if dates are equal.   
    if (dateValidation === 1) {
        res.status(400).json({
            message: "Your project cannot start after it ends, that just doesn't make sense."
        });
        return;
    }

    // Validation: location set correctly
    if (!isRemote) {
        if (!city || !country) {
            res.status(400).json({
                message: "Please select where the project will be done."
            });
            return;
        }
    }

    // If all required data has been sent --> add project to db collection:
    await Project.create({
        ...req.body,
        initiator: user
    }).then(async (newProject) => {
        await User.findByIdAndUpdate(user, {
            $push: {
                ownProjects: newProject._id
            }
        }, {
            "new": true
        }).then(() => console.log("Added new project to users ownProject array."))

        return res.status(200).json(newProject._id)
    }).catch((err) => {

        next(err)
    })
})

// single project page
router.get('/:projectId', isLoggedIn, async (req, res) => {
    const currentUser = req.user
    const {
        projectId
    } = req.params
    let projectData;
    const userStatus = {
        alreadyCollab: false,
        alreadyPending: false,
        isInitiator: false
    };

    // checks, if current user is already a collaborator in this project:
    await Project.findOne({
        $and: [{
            _id: Types.ObjectId(projectId)
        }, {
            collaborators: {
                $in: Types.ObjectId(currentUser)
            }
        }]
    }).populate("initiator collaborators sample").populate({
        path: 'comments',
        populate: {
            path: 'author'
        }
    }).then((project) => {
        if (project) {
            console.log("---- ", "alreadyCollab")
            userStatus.alreadyCollab = true;
            projectData = project
        }
    }).catch((err) => {
        console.log("in alreadyCollab", err)
        res.status(500).json(err)
    })

    // checks, if current user is already waiting to become a collaborator:
    if (!userStatus.alreadyCollab) {
        await Project.findOne({
            $and: [{
                _id: Types.ObjectId(projectId)
            }, {
                pendingCollabs: {
                    $in: Types.ObjectId(currentUser)
                }
            }]
        }).populate("initiator collaborators sample").populate({
            path: 'comments',
            populate: {
                path: 'author'
            }
        }).then((project) => {
            if (project) {
                console.log("---- ", "pendingCollab")
                userStatus.alreadyPending = true;
                projectData = project
            }
        }).catch((err) => {
            console.log("in pendingCollab", err)
            res.status(500).json(err)
        })
    }

    // checks, if current user is the initiator of this project:
    if (!userStatus.alreadyCollab && !userStatus.alreadyPending) {
        await Project.findOne({
            $and: [{
                _id: Types.ObjectId(projectId)
            }, {
                initiator: Types.ObjectId(currentUser)
            }]
        }).populate("initiator collaborators pendingCollabs sample").populate({
            path: 'comments',
            populate: {
                path: 'author'
            }
        }).then((project) => {
            if (project) {
                console.log("---- ", "initiator")
                userStatus.isInitiator = true;
                projectData = project
            }
        }).catch((err) => {
            console.log("in initiator", err)
            res.status(500).json(err)
        })
    }

    // if none of the above applies, this code will be executed:
    if (!userStatus.alreadyCollab && !userStatus.alreadyPending && !userStatus.isInitiator) {
        await Project.findById(req.params.projectId).populate("initiator collaborators sample").populate({
            path: 'comments',
            populate: {
                path: 'author'
            }
        }).then((project) => {
            projectData = project;
        }).catch((err) => {
            console.log("Fetching the project details failed, ", err)
            res.status(500).json(err)
        })
    }

    console.log(`Collab: ${userStatus.alreadyCollab}, Pending: ${userStatus.alreadyPending}, Initiator: ${userStatus.isInitiator}`)

    res.status(200).json({
        project: projectData,
        aUserStatus: userStatus
    })
})

// delete a project
router.post('/:projectId/delete', isLoggedIn, async (req, res) => {
    const {
        projectId
    } = req.params;
    console.log(req.params);
    if (!req.params.projectId) {
        throw createError.NotFound("Project Not Found");
    }
    const currentUser = req.user;

    // check if current user is the initiator
    await Project.findOne({
        $and: [{
            _id: Types.ObjectId(projectId)
        }, {
            initiator: Types.ObjectId(currentUser)
        }]
    }).populate("sample").then(async (foundProject) => {

        const {
            collaborators,
            pendingCollabs,
            sample
        } = foundProject;
        console.log("Collabs: ", collaborators, "|| Pending: ", pendingCollabs)

        // only if user is initiator --> delete project
        if (foundProject) {
            await Project.findByIdAndDelete(projectId).then(() => {
                console.log("Successfully deleted the project.")
            })

            // remove project from all collab users
            for (const collab of collaborators) {
                console.log("LOOOOP collabs --- ", collab)

                await User.findByIdAndUpdate(collab, {
                    "$pull": {
                        "collabProjects": Types.ObjectId(projectId)
                    }
                }, {
                    "new": true
                }).then(() => console.log("Removed project from users collaboration list.")).catch((err) => console.log("ERROR while trying to pull project from users collaboration list. ", err))
            }

            // remove project from initiator
            await User.findByIdAndUpdate(currentUser, {
                "$pull": {
                    "ownProjects": Types.ObjectId(projectId)
                }
            }, {
                "new": true
            }).then(() => console.log("Removed project from initiator.")).catch((err) => console.log("ERROR while trying to pull project from initiator. ", err))

        } else {
            return res.status(400).json({
                message: "You are not the initiator, you cannot delete this project."
            })
        }
    }).then(async () => {

        // delete related chat:
        const deletedChat = await Chat.findOne({
            project: Types.ObjectId(projectId)
        })
        if (!deletedChat) {
            return res.status(200).json("Backend deleted the project. Congrats.")
        }
        // delete chat messages:
        await Message.deleteMany({
            chatId: Types.ObjectId(deletedChat._id)
        })

        await Chat.findOneAndDelete({
            project: Types.ObjectId(projectId)
        })

        return res.status(200).json("Backend deleted the project. Congrats.")
    }).catch((err) => console.log("Delete project did not work.", err))
})

// handle request to join/leave a project:
router.post('/:projectId/:userId', isLoggedIn, async (req, res) => {
    const {
        projectId,
        userId
    } = req.params;
    // console.log("-- TRIGGER --")
    // console.log("PARAM--> ", userId)
    // console.log("REQ--> ", req.user)

    await Project.findById(projectId).then(async (project) => {
        const {
            initiator,
            collaborators,
            pendingCollabs
        } = project;

        // Check if user is initiator:
        const isInitiator = initiator.equals(userId)
        console.log("Initiator? ", isInitiator)

        // Check if already collab:
        const alreadyCollab = collaborators.find((element) => element.equals(userId))
        console.log("Already? ", alreadyCollab)

        if (alreadyCollab) {
            // remove user from project
            await Project.findByIdAndUpdate(projectId, {
                "$pull": {
                    "collaborators": Types.ObjectId(userId)
                }
            }, {
                "new": true
            }).then(() => res.status(200).json("Removed user from project collaborators"))

            // remove project from user
            await User.findByIdAndUpdate(userId, {
                "$pull": {
                    "collabProjects": Types.ObjectId(projectId)
                }
            }, {
                "new": true
            }).then(() => res.status(200).json("Removed from users collabProjects"))
        }

        // Check if already pending:
        const alreadyPending = await pendingCollabs.find(async (element) => {
            element.equals(userId)
        })
        console.log("Pending? ", alreadyPending)

        if (alreadyPending) {
            // remove user from pending list
            await Project.findByIdAndUpdate(projectId, {
                "$pull": {
                    "pendingCollabs": Types.ObjectId(userId)
                }
            }, {
                "new": true
            }).then(() => res.status(200).json("Removed from pending"))
        }

        if (!alreadyCollab && !alreadyPending && !isInitiator) {
            // add user to pending list
            await Project.findByIdAndUpdate(projectId, {
                "$push": {
                    "pendingCollabs": Types.ObjectId(userId)
                }
            }, {
                "new": true
            }).then(() => {
                res.status(200).json(`-- Added user to pending list --`)
            })
        }
    }).catch((err) => {
        console.log("ERR ", err)
        res.status(500).json(err)
    })
})

// accepting user request
router.post('/:projectId/:requestingUserId/accept', isLoggedIn, async (req, res) => {
    const {
        projectId,
        requestingUserId
    } = req.params;
    const currentUser = req.user

    // check if current user is initiator
    const isInitiator = await Project.findOne({
        $and: [{
            _id: projectId
        }, {
            initiator: currentUser
        }]
    })

    if (!isInitiator) {
        res.status(400).json({
            message: "You are not the initiator of this project."
        })
        return
    }

    // add to collaborator array:
    await Project.findByIdAndUpdate(projectId, {
        "$push": {
            "collaborators": Types.ObjectId(requestingUserId)
        }
    }, {
        "new": true
    }).then(async () => {

        // remove from pending list:
        await Project.findByIdAndUpdate(projectId, {
            "$pull": {
                "pendingCollabs": Types.ObjectId(requestingUserId)
            }
        }, {
            "new": true
        }).then(() => res.status(200).json("User request is taken care of."))

        // add project to users collabProjects array
        await User.findByIdAndUpdate(requestingUserId, {
            "$push": {
                "collabProjects": Types.ObjectId(projectId)
            }
        }, {
            "new": true
        }).then(() => console.log("Added project to users collabProjects array."))
    }).catch((err) => {
        res.status(500).json(err)
    })
})

// rejecting user request
router.post('/:projectId/:requestingUserId/reject', isLoggedIn, async (req, res) => {
    const {
        projectId,
        requestingUserId
    } = req.params;
    const currentUser = req.user

    // check if current user is initiator
    const isInitiator = await Project.findOne({
        $and: [{
            _id: projectId
        }, {
            initiator: currentUser
        }]
    })

    if (!isInitiator) {
        res.status(400).json({
            message: "You are not the initiator of this project."
        })
        return
    }

    // remove from pending list:
    await Project.findByIdAndUpdate(projectId, {
        "$pull": {
            "pendingCollabs": Types.ObjectId(requestingUserId)
        }
    }, {
        "new": true
    }).then(() => res.status(200).json("Backend took care of the rejection, you got a clean plate")).catch((err) => {
        res.status(500).json(err)
    })

})

module.exports = router;