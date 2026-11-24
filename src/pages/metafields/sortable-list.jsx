import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { HolderOutlined } from '@ant-design/icons';
import { Button, Tag } from 'antd';

function SortableRow({ entry, index }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: String(entry.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='flex items-center gap-3 bg-gray-50 border border-gray-200 rounded px-4 py-2 shadow-sm'
    >
      <Button
        type='text'
        icon={<HolderOutlined />}
        aria-label='Kéo để sắp xếp'
        {...attributes}
        {...listeners}
      />
      <Tag color='blue'>Vị trí {index + 1}</Tag>
      <div className='flex-1 min-w-0'>
        <div className='font-semibold truncate'>{entry.parsedValue?.question}</div>
        <div className='text-xs text-gray-500'>
          {entry.parsedValue?.categories || 'Không phân loại'}
        </div>
      </div>
      {entry.parsedValue?.schema ? <Tag color='green'>Schema Markup</Tag> : null}
    </div>
  );
}

const SortableFaqList = ({ entries, onChange }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = entries.findIndex((entry) => String(entry.id) === active.id);
    const newIndex = entries.findIndex((entry) => String(entry.id) === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(entries, oldIndex, newIndex));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={entries.map((entry) => String(entry.id))}
        strategy={verticalListSortingStrategy}
      >
        <div className='space-y-2'>
          {entries.map((entry, index) => (
            <SortableRow key={entry.id} entry={entry} index={index} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default SortableFaqList;
