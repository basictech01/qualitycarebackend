import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextFunction, Router, Response } from "express";
import dotenv from "dotenv";
import crypto, { verify } from "crypto";
import { createHmac } from 'crypto';
import { successResponse } from "@utils/reponse";
import { ERRORS } from "@utils/error";
import { verifyAdmin, verifyClient } from "@middleware/auth";
import { Request } from '@customTypes/connection';

import {
  AWS_ACCESS_KEY_ID,
  AWS_ENDPOINT_URL_S3,
  AWS_FILE_LOCATION,
  AWS_REGION,
  AWS_S3_BUCKET,
  AWS_SECRET_ACCESS_KEY,
  FILE_CREATION_SECRET_KEY,
} from "../utils/contants";

var router = Router();

const s3 = new S3Client({
    region: AWS_REGION!,
    endpoint: AWS_ENDPOINT_URL_S3!,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID!,
      secretAccessKey: AWS_SECRET_ACCESS_KEY!,
    },
  });

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

function createFileName(num: number): string {
  const secret = FILE_CREATION_SECRET_KEY; // Change this for better security
  const hash = createHmac('sha256', secret)
      .update(num.toString())
      .digest('base64')
      .replace(/[^a-zA-Z0-9]/g, '')  // Keep only alphanumeric chars
      .slice(0, 16);                 // Trim to 16 characters

  return hash;
}

router.post("/",
  verifyClient,
  // @ts-ignore
  upload.single('photo'), 
  async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw ERRORS.FILE_NOT_FOUND;
    }
    if (!req.userID) {
      throw ERRORS.AUTH_UNAUTHERISED;
    }

    const fileBuffer = req.file.buffer;
    const fileName = createFileName(req.userID!!);
    const params = {
      Bucket: AWS_S3_BUCKET!,
      Key: fileName,
      Body: fileBuffer,
      ContentType: req.file.mimetype,
    };

    await s3.send(new PutObjectCommand(params));
    res.send(successResponse({url: `${AWS_FILE_LOCATION}/${fileName}`}));
  } catch (error) {
    next(error);
  }
});


router.post("/admin",
  verifyAdmin,
  // @ts-ignore
  upload.single('photo'), 
  async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw ERRORS.FILE_NOT_FOUND;
    }
    if (!req.userID) {
      throw ERRORS.AUTH_UNAUTHERISED;
    }

    const fileBuffer = req.file.buffer;
    const fileName = createFileName(Date.now());
    const params = {
      Bucket: AWS_S3_BUCKET!,
      Key: fileName,
      Body: fileBuffer,
      ContentType: req.file.mimetype,
    };

    await s3.send(new PutObjectCommand(params));
    res.send(successResponse({url: `${AWS_FILE_LOCATION}/${fileName}`}));
  } catch (error) {
    next(error);
  }
});

export default router;