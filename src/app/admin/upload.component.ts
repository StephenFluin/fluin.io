import { Component, ElementRef, computed, effect, input, output, signal, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { remove as deleteDB } from 'firebase/database';
import { deleteObject as deleteStorage } from 'firebase/storage';
import { FirebaseService } from './firebase.service';

export interface Image {
    /** The full fb storage path */
    path: string;
    /** Just the name of the file */
    filename: string;
    /** A promise with a download or <img> url */
    downloadURL?: Promise<string>;
    /** The key where it's stored in the DB */
    key?: string;
}

@Component({
    selector: 'image-upload',
    template: `
        <div class="upload">
            <label for="image-file" class="visually-hidden">Choose images to upload</label>
            <input #fileInput id="image-file" type="file" accept="image/*" multiple />
            <button type="button" class="button" (click)="upload()" [disabled]="uploading()">Upload</button>
            <span class="muted" role="status">{{ uploadStatus() }}</span>
        </div>

        @if (imageList().length) {
            <ul class="gallery">
                @for (img of imageList(); track img.key) {
                    <li>
                        <img [src]="img.downloadURL | async" [alt]="img.filename" loading="lazy" />
                        <span class="filename muted" [title]="img.filename">{{ img.filename }}</span>
                        <span class="actions">
                            <button type="button" class="button small" (click)="insertImage(img)">Insert</button>
                            <button type="button" class="button small" (click)="useImageAsCover(img)">
                                Use as cover
                            </button>
                            <button type="button" class="button small danger" (click)="delete(img)">Delete</button>
                        </span>
                    </li>
                }
            </ul>
        } @else {
            <p class="muted">No images uploaded for this post yet.</p>
        }
    `,
    styles: `
        .upload {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 12px;
        }
        .gallery {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 16px;
            margin: 16px 0 0;
            padding: 0;
            list-style: none;
        }
        .gallery li {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .gallery img {
            width: 100%;
            aspect-ratio: 4 / 3;
            object-fit: cover;
            border-radius: 6px;
            background: #eee;
        }
        .filename {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .actions {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [AsyncPipe],
})
export class UploadComponent {
    /**
     * The name of the folder for images
     * eg. posts/angular-is-awesome
     */
    folder = input.required<string>();
    /** Markdown for an image, to insert into the post body */
    insert = output<string>();
    /** The URL of an image to use as the post's cover image */
    useAsCover = output<string>();

    fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
    uploading = signal(false);
    uploadStatus = signal('');

    // List of files from realtime DB
    fileList = signal<Image[]>([]);
    // List of files with downloadURLs, generated as promises
    imageList = computed(() =>
        this.fileList().map((item) => ({ ...item, downloadURL: this.firebaseService.getUrl(item.path) }))
    );

    constructor(public firebaseService: FirebaseService) {
        // Re-listen whenever the folder changes, and stop listening to the old one
        effect((onCleanup) => {
            onCleanup(this.firebaseService.watchList<Image>(`/${this.folder()}/images`, (list) => this.fileList.set(list)));
        });
    }

    /**
     * Store each picked file in FB storage as /posts/post-id/filename.jpg,
     * then remember we have it in the DB as /posts/post-id/images/<key>/{path, filename}
     */
    async upload() {
        const input = this.fileInput().nativeElement;
        const files = [...(input.files ?? [])];
        if (!files.length) {
            this.uploadStatus.set('Choose one or more images first.');
            return;
        }

        const folder = this.folder();
        this.uploading.set(true);
        this.uploadStatus.set(`Uploading ${files.length} image${files.length > 1 ? 's' : ''}...`);
        try {
            for (const file of files) {
                const path = `/${folder}/${file.name}`;
                // cache files for up to a week
                await this.firebaseService.upload(this.firebaseService.getStorageRef(path), file, {
                    cacheControl: 'max-age=604800',
                });
                await this.firebaseService.push(`/${folder}/images/`, { path, filename: file.name });
            }
            this.uploadStatus.set('Uploaded.');
            input.value = '';
        } catch (error) {
            this.uploadStatus.set(`Upload failed: ${error instanceof Error ? error.message : error}`);
        } finally {
            this.uploading.set(false);
        }
    }

    async insertImage(image: Image) {
        const alt = image.filename.replace(/\.[^.]+$/, '');
        this.insert.emit(`![${alt}](${await image.downloadURL})`);
    }

    async useImageAsCover(image: Image) {
        this.useAsCover.emit(await image.downloadURL);
    }

    delete(image: Image) {
        if (!confirm(`Delete ${image.filename}? Posts that use it will show a broken image.`)) {
            return;
        }
        const storagePath = image.path;
        const dbPath = `${this.folder()}/images/` + image.key;

        // Do these as two separate steps so you can still try delete ref if file no longer exists

        deleteDB(this.firebaseService.dbRef(dbPath)).catch((error) =>
            console.error('Error deleting memory of stored file', dbPath, error)
        );

        deleteStorage(this.firebaseService.getStorageRef(storagePath)).catch((error) => {
            console.error('Error deleting file from storage', storagePath, error);
        });
    }
}
