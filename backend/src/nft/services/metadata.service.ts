import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';

@Injectable()
export class MetadataService {
  private readonly logger = new Logger(MetadataService.name);

  /**
   * 上传 SVG 图片到 IPFS
   */
  async uploadImageToIPFS(svgContent: string, fileName: string): Promise<string> {
    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecretKey = process.env.PINATA_SECRET_KEY;

    if (pinataApiKey && pinataSecretKey) {
      return this.uploadToPinata(svgContent, fileName, pinataApiKey, pinataSecretKey);
    }

    // 未配置 IPFS 时，返回本地占位 URI
    this.logger.warn('未配置 PINATA_API_KEY/PINATA_SECRET_KEY，使用本地占位 URI');
    return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
  }

  /**
   * 上传 JSON 元数据到 IPFS
   */
  async uploadMetadataToIPFS(metadata: any, fileName: string): Promise<string> {
    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecretKey = process.env.PINATA_SECRET_KEY;

    if (pinataApiKey && pinataSecretKey) {
      return this.uploadJSONToPinata(metadata, fileName, pinataApiKey, pinataSecretKey);
    }

    // 未配置 IPFS 时，返回可公开访问的元数据 API 路径
    this.logger.warn('未配置 IPFS 凭证，使用本地 API URI');
    return `${process.env.API_BASE_URL || 'http://localhost:3000'}/api/nft/metadata/${fileName.replace('.json', '')}`;
  }

  /**
   * 构造 OpenSea 兼容的 Token URI 元数据
   */
  buildMetadata(params: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{ trait_type: string; value: string }>;
  }): any {
    return {
      name: params.name,
      description: params.description,
      image: params.image,
      external_url: '',
      attributes: params.attributes,
    };
  }

  /**
   * 上传到 Pinata（文件）
   */
  private async uploadToPinata(
    content: string,
    fileName: string,
    apiKey: string,
    secretKey: string,
  ): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', Buffer.from(content), {
        filename: fileName,
        contentType: fileName.endsWith('.svg') ? 'image/svg+xml' : 'application/json',
      });

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            pinata_api_key: apiKey,
            pinata_secret_key: secretKey,
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        },
      );

      const ipfsHash = response.data.IpfsHash;
      this.logger.log(`IPFS 上传成功 → ${ipfsHash}`);
      return `ipfs://${ipfsHash}`;
    } catch (error) {
      this.logger.error('IPFS 上传失败', error);
      throw error;
    }
  }

  /**
   * 上传 JSON 到 Pinata
   */
  private async uploadJSONToPinata(
    json: any,
    fileName: string,
    apiKey: string,
    secretKey: string,
  ): Promise<string> {
    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        json,
        {
          headers: {
            pinata_api_key: apiKey,
            pinata_secret_key: secretKey,
          },
        },
      );

      const ipfsHash = response.data.IpfsHash;
      this.logger.log(`IPFS JSON 上传成功 → ${ipfsHash}`);
      return `ipfs://${ipfsHash}`;
    } catch (error) {
      this.logger.error('IPFS JSON 上传失败', error);
      throw error;
    }
  }
}
