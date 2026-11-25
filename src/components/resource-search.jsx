import { useEffect, useMemo, useRef, useState } from 'react';
import { AutoComplete, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useResourceSearch } from '../common/ResourceService';
import { RESOURCE_TYPES } from '../lib/resources';

const ResourceSearch = ({ type }) => {
  const navigate = useNavigate();
  const config = RESOURCE_TYPES[type];
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setQuery('');
    setDebouncedQuery('');
  }, [type]);

  const { data: results = [], isFetching } = useResourceSearch(type, debouncedQuery, 10);

  const options = useMemo(
    () =>
      (results ?? []).map((item) => ({
        value: String(item.id),
        item,
        label: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {item.image ? (
              <img
                src={item.image}
                alt={item.title}
                width={32}
                height={32}
                style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4 }}
              />
            ) : null}
            <span style={{ fontWeight: 500 }}>{item.title}</span>
          </div>
        ),
      })),
    [results]
  );

  const handleSelect = (_value, option) => {
    const item = option?.item;
    if (!item) return;
    const params = new URLSearchParams({ id: String(item.id), title: item.title ?? '' });
    navigate(`${config.path}?${params.toString()}`);
    setQuery('');
    setDebouncedQuery('');
    inputRef.current?.blur();
  };

  return (
    <AutoComplete
      ref={inputRef}
      style={{ width: 380, maxWidth: '100%' }}
      options={options}
      onSelect={handleSelect}
      onSearch={setQuery}
      value={query}
      filterOption={false}
      allowClear
      notFoundContent={
        isFetching
          ? 'Đang tìm kiếm...'
          : debouncedQuery.trim().length >= 2
            ? `Không tìm thấy ${config.label}`
            : 'Nhập ít nhất 2 ký tự'
      }
      popupMatchSelectWidth={380}
      styles={{ popup: { root: { maxHeight: 400, overflowY: 'auto' } } }}
    >
      <Input
        aria-label={config.searchPlaceholder}
        placeholder={config.searchPlaceholder}
        prefix={<SearchOutlined style={{ color: '#999' }} />}
      />
    </AutoComplete>
  );
};

export default ResourceSearch;
