import { Photo } from '../models';
import { AppDataSource } from '../configuration';

export async function savePhoto(photoData: Partial<Photo>): Promise<Photo> {
  const photo = new Photo();
  photo.name = photoData.name || 'Default Name';
  photo.description = photoData.description || 'Default Description';
  photo.filename = photoData.filename || 'default.jpg';
  photo.views = photoData.views || 0;
  photo.isPublished = photoData.isPublished || false;

  try {
    const savedPhoto = await AppDataSource.manager.save(photo);
    return savedPhoto;
  } catch (error) {
    throw new Error(`Error while saving photo: ${error.message}`);
  }
}

export async function findPhoto(): Promise<Photo[]> {
  try {
    const savedPhotos = await AppDataSource.manager.find(Photo);
    return savedPhotos;
  } catch (error) {
    throw new Error(`Error while fetching photos: ${error.message}`);
  }
}
