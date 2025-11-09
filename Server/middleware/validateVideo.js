const VideoGenerationFactory = require('../services/videoGenerationFactory');

/**
 * Validation Middleware for Video API Requests
 * Validates request parameters before reaching controllers
 */

/**
 * Validate video creation request
 * Checks for required fields and service validity
 */
const validateCreateVideo = (req, res, next) => {
  const { service, ...params } = req.body;

  // Check if request body exists
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Request body is required',
      message: 'Please provide service and video parameters',
    });
  }

  // Check if service is provided
  if (!service) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: service',
      message: 'Service name is required (e.g., "heygen" or "veo3")',
      availableServices: VideoGenerationFactory.getAvailableServices(),
    });
  }

  // Validate service is supported
  if (!VideoGenerationFactory.isServiceSupported(service)) {
    return res.status(400).json({
      success: false,
      error: `Unsupported service: ${service}`,
      message: 'Please use a supported video generation service',
      availableServices: VideoGenerationFactory.getAvailableServices(),
    });
  }

  // Service-specific validation
  if (service.toLowerCase() === 'heygen') {
    // HeyGen requires: avatarId, voiceId, script
    const requiredFields = ['avatarId', 'voiceId', 'script'];
    const missingFields = requiredFields.filter(field => !params[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields for HeyGen',
        message: `Required fields: ${requiredFields.join(', ')}`,
        missingFields,
      });
    }

    // Validate script length
    if (params.script && params.script.length > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Script too long',
        message: 'Script must be less than 10000 characters',
      });
    }
  }

  if (service.toLowerCase() === 'veo3') {
    // Veo3 requires: prompt
    if (!params.prompt) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: prompt',
        message: 'Prompt is required for Google Veo 3',
      });
    }

    // Validate prompt length
    if (params.prompt && params.prompt.length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'Prompt too long',
        message: 'Prompt must be less than 2000 characters',
      });
    }

    // Validate duration if provided
    if (params.duration && (params.duration < 1 || params.duration > 60)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid duration',
        message: 'Duration must be between 1 and 60 seconds',
      });
    }

    // Validate aspect ratio if provided
    const validAspectRatios = ['16:9', '9:16', '1:1'];
    if (params.aspectRatio && !validAspectRatios.includes(params.aspectRatio)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid aspect ratio',
        message: `Aspect ratio must be one of: ${validAspectRatios.join(', ')}`,
      });
    }
  }

  if (service.toLowerCase() === 'kie') {
    // Kie.ai requires: prompt
    if (!params.prompt) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: prompt',
        message: 'Prompt is required for Kie.ai',
      });
    }

    // Validate prompt length
    if (params.prompt && params.prompt.length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'Prompt too long',
        message: 'Prompt must be less than 2000 characters',
      });
    }

    // Validate duration if provided
    if (params.duration && (params.duration < 1 || params.duration > 60)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid duration',
        message: 'Duration must be between 1 and 60 seconds',
      });
    }

    // Validate aspect ratio if provided
    const validAspectRatios = ['16:9', '9:16', '1:1'];
    if (params.aspectRatio && !validAspectRatios.includes(params.aspectRatio)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid aspect ratio',
        message: `Aspect ratio must be one of: ${validAspectRatios.join(', ')}`,
      });
    }

    // Validate model if provided
    const validModels = ['veo3.1-fast', 'veo3.1-standard'];
    if (params.model && !validModels.includes(params.model)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid model',
        message: `Model must be one of: ${validModels.join(', ')}`,
      });
    }
  }

  // Validation passed
  console.log(`✅ Validation passed for service: ${service}`);
  next();
};

/**
 * Validate video ID parameter
 * Checks if :id parameter is provided and valid
 */
const validateVideoId = (req, res, next) => {
  const { id } = req.params;

  // Check if ID exists
  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Video ID is required',
      message: 'Please provide a valid video ID',
    });
  }

  // Check if ID is not empty string
  if (id.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Invalid video ID',
      message: 'Video ID cannot be empty',
    });
  }

  // Basic format validation (alphanumeric, hyphens, underscores)
  const validIdPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validIdPattern.test(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid video ID format',
      message: 'Video ID can only contain letters, numbers, hyphens, and underscores',
    });
  }

  // Validation passed
  console.log(`✅ Video ID validation passed: ${id}`);
  next();
};

/**
 * Validate query parameters for list videos
 * Checks pagination and filter parameters
 */
const validateListVideos = (req, res, next) => {
  const { page, limit, service, status } = req.query;

  // Validate page number
  if (page && (isNaN(page) || parseInt(page) < 1)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid page number',
      message: 'Page must be a positive integer',
    });
  }

  // Validate limit
  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid limit',
      message: 'Limit must be between 1 and 100',
    });
  }

  // Validate service filter if provided
  if (service && !VideoGenerationFactory.isServiceSupported(service)) {
    return res.status(400).json({
      success: false,
      error: `Unsupported service filter: ${service}`,
      availableServices: VideoGenerationFactory.getAvailableServices(),
    });
  }

  // Validate status filter if provided
  const validStatuses = ['pending', 'processing', 'completed', 'failed'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid status filter',
      message: `Status must be one of: ${validStatuses.join(', ')}`,
    });
  }

  // Validation passed
  console.log('✅ List videos validation passed');
  next();
};

module.exports = {
  validateCreateVideo,
  validateVideoId,
  validateListVideos,
};