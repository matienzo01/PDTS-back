import { Request, Response } from 'express';

export const uploadFile = (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).send('No file uploaded.');
    return;
  }

  const fileName = req.file.filename;
  res.status(200).json({message: `File uploaded successfully. Filename: ${fileName}`});
};