import React from "react";
import ReactMarkdown from "react-markdown";

type UpdateAttachment = {
  url: string;
  alt?: string;
};

type Update = {
  title: string;
  content: string;
  date?: string;
  attachments?: UpdateAttachment[];
};

type UpdatesProps = {
  updates: Update[];
};

const Updates: React.FC<UpdatesProps> = ({ updates }) => {
  const sortedUpdates = [...updates].sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Updates</h2>
        <button
          type="button"
          aria-label="Enable notifications for new updates"
          className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-blue-600"
        >
          <svg
            className="w-4 h-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 3a5 5 0 0 0-5 5v3.586l-1.707 1.707A1 1 0 0 0 6 15h12a1 1 0 0 0 .707-1.707L17 11.586V8a5 5 0 0 0-5-5Z"
            />
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.5 18a2.5 2.5 0 0 0 5 0"
            />
          </svg>
        </button>
      </div>

      {sortedUpdates.length === 0 ? (
        <p className="text-base text-gray-500">
          No updates have been posted yet.
        </p>
      ) : (
        <div className="space-y-6">
          {sortedUpdates.map((update, index) => (
            <div
              key={index}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              <div className="items-center justify-between sm:flex">
                <div className="text-lg font-semibold text-gray-900">
                  {update.title}
                </div>
                {update.date && (
                  <time className="mb-1 text-xs font-normal text-gray-400 sm:order-last sm:mb-0">
                    {new Date(update.date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                )}
              </div>

              <div className="mt-2 text-base font-normal text-gray-500 prose prose-sm max-w-none prose-p:my-2 prose-a:text-blue-600">
                <ReactMarkdown>{update.content}</ReactMarkdown>
              </div>

              {update.attachments && update.attachments.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {update.attachments.map((attachment, attachmentIndex) => (
                    <img
                      key={attachmentIndex}
                      src={attachment.url}
                      alt={attachment.alt ?? `${update.title} attachment`}
                      className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Updates;
