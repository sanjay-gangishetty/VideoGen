const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const {
  validateCreateVideo,
  validateVideoId,
  validateListVideos,
} = require('../middleware/validateVideo');

/**
 * Video Generation API Routes
 * All routes are prefixed with /api/videos
 */

/**
 * @route   POST /api/videos
 * @desc    Create a new video generation job
 * @access  Public (TODO: Add authentication middleware)
 * @body    {
 *            service: 'heygen' | 'veo3',
 *            ...serviceSpecificParams
 *          }
 * @returns {
 *            success: true,
 *            data: { videoId, status, service }
 *          }
 */
router.post('/', validateCreateVideo, videoController.createVideo);

/**
 * @route   GET /api/videos
 * @desc    Get all videos with pagination and filters
 * @access  Public (TODO: Add authentication middleware)
 * @query   {
 *            page: number,
 *            limit: number,
 *            service: 'heygen' | 'veo3',
 *            status: 'pending' | 'processing' | 'completed' | 'failed'
 *          }
 * @returns {
 *            success: true,
 *            data: { videos: [], pagination: {} }
 *          }
 */
router.get('/', validateListVideos, videoController.listVideos);

/**
 * @route   GET /api/videos/:id
 * @desc    Get video status and metadata by ID
 * @access  Public (TODO: Add authentication middleware)
 * @param   {string} id - Video ID
 * @returns {
 *            success: true,
 *            data: { videoId, status, service, progress, ... }
 *          }
 */
router.get('/:id', validateVideoId, videoController.getVideoStatus);

/**
 * @route   GET /api/videos/:id/download
 * @desc    Download completed video by ID
 * @access  Public (TODO: Add authentication middleware)
 * @param   {string} id - Video ID
 * @returns Video file stream or redirect to video URL
 */
router.get('/:id/download', validateVideoId, videoController.downloadVideo);

/**
 * @route   DELETE /api/videos/:id
 * @desc    Cancel ongoing video generation (optional feature)
 * @access  Public (TODO: Add authentication middleware)
 * @param   {string} id - Video ID
 * @returns {
 *            success: true,
 *            data: { videoId, status: 'cancelled' }
 *          }
 */
router.delete('/:id', validateVideoId, videoController.cancelVideo);

module.exports = router;