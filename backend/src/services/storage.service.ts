import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config';

const s3 = new S3Client({ region: config.aws.region, credentials: { accessKeyId: config.aws.accessKeyId, secretAccessKey: config.aws.secretAccessKey } });

export const storageService = {
  async uploadBuffer(buffer: Buffer, key: string, contentType: string): Promise<string> {
    await s3.send(new PutObjectCommand({ Bucket: config.aws.bucket, Key: key, Body: buffer, ContentType: contentType }));
    return `https://${config.aws.bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;
  },
  async getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    return getSignedUrl(s3, new GetObjectCommand({ Bucket: config.aws.bucket, Key: key }), { expiresIn });
  },
  async deleteFile(key: string): Promise<void> {
    await s3.send(new DeleteObjectCommand({ Bucket: config.aws.bucket, Key: key }));
  },
  getKeyFromUrl(url: string): string {
    return url.split('.amazonaws.com/')[1] || '';
  },
};
