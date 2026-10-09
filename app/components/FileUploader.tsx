import {useState, useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import { formatSize } from '../lib/utils'

interface FileUploaderProps {
    file: File | null;
    disabled?: boolean;
    onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ file, disabled = false, onFileSelect }: FileUploaderProps) => {
    const [error, setError] = useState('');
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0] || null;

        if (file) { setError(''); onFileSelect?.(file); }
    }, [onFileSelect]);

    const maxFileSize = 20 * 1024 * 1024; // 20MB in bytes

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop,
        disabled,
        onDropRejected: () => setError('Choose one PDF file no larger than 20 MB.'),
        multiple: false,
        accept: { 'application/pdf': ['.pdf']},
        maxSize: maxFileSize,
    })




    return (
        <div className={`w-full upload-dropzone ${isDragActive ? 'is-dragging' : ''}`}>
            <div {...getRootProps()}>
                <input {...getInputProps({ id: 'uploader' })} />

                <div className="space-y-4 cursor-pointer">
                    {file ? (
                        <div className="uploader-selected-file" onClick={(e) => e.stopPropagation()}>
                            <img src="/images/pdf.png" alt="pdf" className="size-10" />
                            <div className="flex items-center space-x-3">
                                <div>
                                    <p className="text-sm font-medium truncate max-w-xs">
                                        {file.name}
                                    </p>
                                    <p className="file-size">
                                        {formatSize(file.size)}
                                    </p>
                                </div>
                            </div>
                            <button type="button" disabled={disabled} aria-label="Remove resume" className="p-2 cursor-pointer" onClick={(e) => {
                                e.stopPropagation();
                                setError('');
                                onFileSelect?.(null)
                            }}>
                                <img src="/icons/cross.svg" alt="remove" className="w-4 h-4" />
                            </button>
                        </div>
                    ): (
                        <div>
                            <div className="dropzone-icon" aria-hidden="true">↑</div>
                            <p className="dropzone-label">
                                <span className="font-semibold">
                                    {isDragActive ? 'Drop your resume here' : 'Choose a file'}
                                </span> or drag and drop
                            </p>
                            <p className="dropzone-hint">PDF only · Up to {formatSize(maxFileSize)}</p>
                        </div>
                    )}
                </div>
            </div>
            {error && <p role="alert">{error}</p>}
        </div>
    )
}
export default FileUploader
