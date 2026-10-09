import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { useAuthGuard } from '~/lib/useAuthGuard';

const WipeApp = () => {
    const { auth, isLoading, error, fs, kv } = usePuterStore();
    const ready = useAuthGuard('/wipe');
    const [files, setFiles] = useState<FSItem[]>([]);
    const [operationError, setOperationError] = useState('');
    const [loadingFiles, setLoadingFiles] = useState(true);
    const [deleting, setDeleting] = useState(false);

    const loadFiles = async () => {
        const files = await fs.readDir("./");
        if (!files) throw new Error('Unable to load files.');
        setFiles(files);
    };

    useEffect(() => {
        let active = true;
        setFiles([]);
        setLoadingFiles(true);
        setOperationError('');
        if (!ready) return;
        fs.readDir('./').then((items) => {
            if (!items) throw new Error('Unable to load files.');
            if (active) setFiles(items);
        }).catch((error) => {
            if (active) setOperationError(error instanceof Error ? error.message : 'Unable to load files.');
        }).finally(() => { if (active) setLoadingFiles(false); });
        return () => { active = false; };
    }, [ready, fs, auth.user?.uuid]);

    const handleDelete = async () => {
        if (!ready || loadingFiles || deleting) return;
        setDeleting(true);
        setOperationError('');
        try {
            const results = await Promise.allSettled(files.map((file) => fs.delete(file.path)));
            if (results.some((result) => result.status === 'rejected')) {
                throw new Error('Some files could not be deleted. Resume records were retained. Please retry.');
            }
            if (!await kv.flush()) throw new Error('Files were deleted, but records could not be cleared. Please retry.');
        } catch (error) {
            setOperationError(error instanceof Error ? error.message : 'Unable to delete app data.');
        } finally {
            try { await loadFiles(); } catch (error) {
                setOperationError(error instanceof Error ? error.message : 'Unable to refresh files.');
            }
            setDeleting(false);
        }
    };

    if (error) {
        return <div>Error {error}</div>;
    }

    if (isLoading || !ready) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            Authenticated as: {auth.user?.username}
            {operationError && <p role="alert">{operationError}</p>}
            {loadingFiles && <p>Loading files...</p>}
            <div>Existing files:</div>
            <div className="flex flex-col gap-4">
                {files.map((file) => (
                    <div key={file.id} className="flex flex-row gap-4">
                        <p>{file.name}</p>
                    </div>
                ))}
            </div>
            <div>
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer"
                    onClick={() => handleDelete()}
                    disabled={loadingFiles || deleting}
                >
                    {deleting ? 'Deleting...' : 'Wipe App Data'}
                </button>
            </div>
        </div>
    );
};

export default WipeApp;
