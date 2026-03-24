interface Props {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl">🔍</div>
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      {description && <p className="text-sm text-gray-500 max-w-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
