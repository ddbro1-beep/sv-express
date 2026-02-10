import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { commentsApi, Comment } from '../api/comments';

interface TimelineProps {
  entityType: 'lead' | 'order';
  entityId: string;
  createdAt: string;
}

const Timeline: React.FC<TimelineProps> = ({ entityType, entityId, createdAt }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await commentsApi.getComments(entityType, entityId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSending) return;

    setIsSending(true);
    try {
      const comment = await commentsApi.addComment(entityType, entityId, newComment.trim());
      setComments([...comments, comment]);
      setNewComment('');
      toast.success('Комментарий добавлен');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Ошибка добавления комментария');
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const entityLabel = entityType === 'lead' ? 'Заявка' : 'Заказ';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-5 h-5 flex items-center justify-center bg-gray-100 rounded text-xs">
          📜
        </span>
        История
      </h3>

      {/* Timeline Content */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {/* Creation event */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="w-0.5 flex-1 bg-gray-200"></div>
          </div>
          <div className="pb-3">
            <p className="text-xs text-gray-500">{formatDate(createdAt)}</p>
            <p className="text-sm text-gray-700">{entityLabel} создана</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-4 text-gray-400 text-sm">
            Загрузка...
          </div>
        ) : (
          comments.map((comment, index) => (
            <div key={comment.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {index < comments.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gray-200"></div>
                )}
              </div>
              <div className="pb-3 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-900">
                    {comment.user_name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-2">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}

        {!isLoading && comments.length === 0 && (
          <div className="text-center py-4 text-gray-400 text-sm">
            Комментариев пока нет
          </div>
        )}
      </div>

      {/* Add Comment Form */}
      <div className="border-t border-gray-200 pt-3">
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
          <span>💬</span>
          Добавить комментарий
        </h4>
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Введите комментарий..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || isSending}
            className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? 'Отправка...' : 'Отправить'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Timeline;
