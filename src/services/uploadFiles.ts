import multer from 'multer';

const customFileName = (req: any, file: any, cb: any) => {
  cb(null, file.originalname);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: customFileName 
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.originalname.endsWith('.zip')) {
    cb(null, true);
  } else {
    cb(new Error('Only .zip files are allowed'), false);
  }
};

export const upload = multer({ storage, fileFilter });