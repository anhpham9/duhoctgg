import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";

const configuredImageMimeTypes = String(process.env.CLOUDINARY_ALLOWED_MIME || "").trim();
export const DEFAULT_IMAGE_MIME_TYPES = (configuredImageMimeTypes || "image/jpeg,image/png,image/webp,image/gif")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

const DEFAULT_IMAGE_MAX_FILE_SIZE = 1 * 1024 * 1024;
const configuredDefaultMaxFileSize = Number(process.env.CLOUDINARY_MAX_FILE_SIZE || DEFAULT_IMAGE_MAX_FILE_SIZE);
export const CMS_DEFAULT_MAX_FILE_SIZE = Number.isFinite(configuredDefaultMaxFileSize) && configuredDefaultMaxFileSize > 0
    ? configuredDefaultMaxFileSize
    : DEFAULT_IMAGE_MAX_FILE_SIZE;

const uploadBufferToCloudinary = (fileBuffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) return reject(error);
            return resolve(result);
        });

        uploadStream.end(fileBuffer);
    });
};

export const ensureCloudinaryReady = () => {
    if (!isCloudinaryConfigured()) {
        throw new Error("Cloudinary is not configured on server");
    }
};

export const validateImageUploadFile = ({
    file,
    allowedMimeTypes = DEFAULT_IMAGE_MIME_TYPES,
    allowedExtensions = [],
    maxFileSize = CMS_DEFAULT_MAX_FILE_SIZE,
    imageLabel = "image"
} = {}) => {
    if (!file) {
        throw new Error("Please select an image file");
    }

    const fileMimeType = String(file.mimetype || "").toLowerCase();
    const fileName = String(file.originalname || "").toLowerCase();
    const extensionAllowed = allowedExtensions.some((extension) => fileName.endsWith(extension));
    const mimeAllowed = allowedMimeTypes.includes(fileMimeType);

    if (!mimeAllowed && !extensionAllowed) {
        throw new Error(`Invalid ${imageLabel} format`);
    }

    if (Number(file.size || 0) > maxFileSize) {
        const maxFileSizeMB = (maxFileSize / (1024 * 1024)).toFixed(2);
        throw new Error(`${imageLabel} exceeds ${maxFileSizeMB} MB limit`);
    }
};

export const uploadImageToCloudinary = async ({
    file,
    folder,
    transformation = [{ quality: "auto", fetch_format: "auto" }],
    resourceType = "image"
} = {}) => {
    ensureCloudinaryReady();

    const uploadResult = await uploadBufferToCloudinary(file.buffer, {
        folder,
        resource_type: resourceType,
        transformation
    });

    return {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        bytes: uploadResult.bytes,
        format: uploadResult.format,
        cloudFolder: folder
    };
};

export const deleteCloudinaryAssetByPublicId = async (publicId) => {
    ensureCloudinaryReady();

    return cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
        invalidate: true
    });
};

export const deleteCloudinaryAssetsSafely = async (publicIds = [], logger = null, context = {}) => {
    const uniquePublicIds = [...new Set(publicIds.filter(Boolean))];

    if (!uniquePublicIds.length || !isCloudinaryConfigured()) {
        return;
    }

    for (const publicId of uniquePublicIds) {
        try {
            await deleteCloudinaryAssetByPublicId(publicId);
        } catch (error) {
            if (typeof logger === "function") {
                logger("Cloudinary cleanup failed", error, {
                    ...context,
                    publicId
                });
            }
        }
    }
};
