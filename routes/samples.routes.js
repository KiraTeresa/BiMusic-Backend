const express = require('express')
const router = express.Router();
const mongoose = require('mongoose');
const Project = require('../models/Project.model');
const Sample = require('../models/Sample.model');
const User = require('../models/User.model');
const createError = require("http-errors");
const isLoggedIn = require('../middleware/isLoggedIn')

// all samples route
router.get("/", isLoggedIn, async (req, res) => {
    try {
        const result = await Sample.find().populate("artist");
        res.status(200).json(result);
    } catch (err) {
        console.log("ERROR getting data from db ", err)
        res.status(500).json(err)
    }
})

router.get("/create", isLoggedIn, async (req, res) => {
    // console.log("REQ SAMPLE CREATE: ", req.query)
    const {
        projectId
    } = req.query
    if (projectId) {
        await Project.findById(projectId).populate('initiator').then((project) => res.status(200).json(project)).catch(err => {
            console.log(err)
            res.status(500).json(err)
        })
    }
})

router.post("/create", isLoggedIn, async (req, res) => {
    console.log("BODY: ", req.body)
    const {
        finalForm,
        projectId
    } = req.body
    const user = mongoose.Types.ObjectId(finalForm.artist);
    const {
        link,
        linkType,
        title,
        year
    } = finalForm;

    // Validation: title is required
    if (!title) {
        res.status(400).json({
            message: "Please provide a title."
        });
        return;
    }

    // TO DO >>> Cloudinary

    // Validation: link
    // const isValidUrl = urlString => {
    //     try {
    //         return Boolean(new URL(urlString));
    //     } catch (e) {
    //         return false;
    //     }
    // }

    // if (!link || !isValidUrl(link)) {
    //     res.status(400).json({
    //         message: "Please provide a valid link to your sample (must contain http or https protocol)."
    //     });
    //     return;
    // }

    // Validation: link type
    if (linkType !== "url" && linkType !== "upload") {
        res.status(400).json({
            message: "Upload type must be selected."
        });
        return;
    }

    // Validation: year is number and not in future
    const currentYear = new Date().getFullYear()
    if (typeof year !== "number" || year > currentYear) {
        res.status(400).json({
            message: "Please provide a valid year which is not in the future."
        });
        return;
    }

    // If all required data has been sent --> add sample to db collection:
    await Sample.create({
        ...finalForm,
        artist: user
    }).then(async (newSample) => {
        console.log("Created new sample in db: ", newSample)

        await User.findByIdAndUpdate(user, {
            $push: {
                samples: newSample._id
            }
        }).then(() => console.log("Added sample to users sample array."))

        if (projectId) {
            await Project.findByIdAndUpdate(projectId, {
                sample: newSample
            }, {
                new: true
            }).then((updatedProject) => {
                console.log("Sample was added to Project: ", updatedProject)
            })
        }

        console.log("Successfully added a sample")
        res.status(200).json(newSample._id)
    }).catch((err) => {
        console.log("Something went wrong when adding a new sample.", err)
        res.status(500).json(err)
    })
})

// get all samples of user
// router.get("/:id", isLoggedIn, async (req, res) => {
//     try {
//         const {
//             id
//         } = req.params;
//         const result = await Sample.find({
//             artist: id
//         });
//         if (!result) {
//             res.json([])
//         }
//         res.status(200).json(result);
//     } catch (e) {
//         console.log(e);
//     }
// })

// get sample detail page
router.get("/sample/:id", isLoggedIn, async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const result = await Sample.findById(id).populate("artist").populate({path: 'feedback', populate: {
            path: 'author'}
        });
        if (!result) {
            res.status(400).json({message: "Sample not found"})
        }
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        res.status(500).json(err)
    }
})

router.delete("/:id", isLoggedIn, async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const userSample = await Sample.findByIdAndDelete(id);
        if (!userSample){
            res.status(400).json({message: "Sample not found"})
        }
        res.status(200).json({
            message: "Sample deleted successfulyy!",
        })
    } catch (err) {
        console.log(err)
        res.status(500).json(err);
    }
});

module.exports = router;