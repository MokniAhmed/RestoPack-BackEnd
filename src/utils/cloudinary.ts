import { v2 as cloudinary } from 'cloudinary'

const { CloudinaryApiName, CloudinaryApiKey, CloudinaryApiSecret } = require('../config/vars')

cloudinary.config({
    cloud_name: CloudinaryApiName,
    api_key: CloudinaryApiKey,
    api_secret: CloudinaryApiSecret,
    secure: true
})

module.exports = cloudinary
