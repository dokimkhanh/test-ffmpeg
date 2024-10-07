const express = require('express');
const multer = require('multer');
const { execFile } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Tạo static route để truy cập các tệp trong thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/merge', upload.fields([{ name: 'video' }, { name: 'audio' }]), (req, res) => {
  const videoPath = req.files['video'][0].path;
  const audioPath = req.files['audio'][0].path;
  const outputFileName = `output_${Date.now()}.mp4`;
  const outputPath = path.join('uploads', outputFileName);  // Đường dẫn đến file output

  const ffmpegArgs = [
    '-i', videoPath,
    '-i', audioPath,
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-strict', 'experimental',
    outputPath
  ];

  execFile(ffmpegPath, ffmpegArgs, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).send('Error merging files');
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
    console.log(`stdout: ${stdout}`);

    // Tạo URL để truy cập file output
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${outputFileName}`;

    // Trả về URL của file đã được tạo
    res.json({
      success: true,
      url: fileUrl
    });
    
  });
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
