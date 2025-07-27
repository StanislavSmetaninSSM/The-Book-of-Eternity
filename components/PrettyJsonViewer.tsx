import React, { useState } from 'react';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface JsonNodeProps {
  data: any;
  level: number;
}

const JsonNode: React.FC<JsonNodeProps> = ({ data, level }) => {
  if (data === null) {
    return <span className="text-gray-500">null</span>;
  }
  if (typeof data === 'string') {
    return <span className="text-green-400">"{data}"</span>;
  }
  if (typeof data === 'number') {
    return <span className="text-blue-400">{data}</span>;
  }
  if (typeof data === 'boolean') {
    return <span className="text-purple-400">{data.toString()}</span>;
  }
  if (Array.isArray(data)) {
    return <JsonArray data={data} level={level} />;
  }
  if (typeof data === 'object') {
    return <JsonObject data={data} level={level} />;
  }
  return <span>{String(data)}</span>;
};

const JsonObject: React.FC<{ data: object; level: number }> = ({ data, level }) => {
  const [isCollapsed, setIsCollapsed] = useState(level > 0); // Collapse nested objects by default
  const keys = Object.keys(data);

  if (keys.length === 0) {
    return <span>{`{}`}</span>;
  }

  return (
    <span>
      <button onClick={() => setIsCollapsed(!isCollapsed)} className="align-middle">
        {isCollapsed ? (
          <ChevronRightIcon className="w-4 h-4 inline-block text-gray-500" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 inline-block text-gray-500" />
        )}
      </button>
      {isCollapsed ? <span>{`{...}`}</span> : (
        <div className="pl-4 border-l border-gray-700">
          <span>{`{`}</span>
          {keys.map((key, index) => (
            <div key={key} className="ml-4">
              <span className="text-cyan-400 font-semibold">"{key}"</span>: <JsonNode data={(data as any)[key]} level={level + 1} />
              {index < keys.length - 1 && <span>,</span>}
            </div>
          ))}
          <div style={{ paddingLeft: `${(level) * 1}rem` }}>{`}`}</div>
        </div>
      )}
    </span>
  );
};

const JsonArray: React.FC<{ data: any[]; level: number }> = ({ data, level }) => {
  const [isCollapsed, setIsCollapsed] = useState(level > 0); // Collapse nested arrays by default
  
  if (data.length === 0) {
    return <span>{`[]`}</span>;
  }

  return (
    <span>
      <button onClick={() => setIsCollapsed(!isCollapsed)} className="align-middle">
        {isCollapsed ? (
          <ChevronRightIcon className="w-4 h-4 inline-block text-gray-500" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 inline-block text-gray-500" />
        )}
      </button>
      {isCollapsed ? <span>{`[...]`}</span> : (
        <div className="pl-4 border-l border-gray-700">
          <span>{`[`}</span>
          {data.map((item, index) => (
            <div key={index} className="ml-4">
              <JsonNode data={item} level={level + 1} />
              {index < data.length - 1 && <span>,</span>}
            </div>
          ))}
          <div style={{ paddingLeft: `${(level) * 1}rem` }}>{`]`}</div>
        </div>
      )}
    </span>
  );
};


const PrettyJsonViewer: React.FC<{ data: object }> = ({ data }) => {
  return (
    <div className="bg-gray-900/50 p-4 rounded-md text-sm font-mono whitespace-pre-wrap">
      <JsonNode data={data} level={0} />
    </div>
  );
};

export default PrettyJsonViewer;
