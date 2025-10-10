import React, { useState, useCallback } from 'react';
import {
  Plane,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Loader2,
  ArrowRightCircle,
} from 'lucide-react';

// ------------------------------------------------------------------
// ✅ Helper Component: InputField
// ------------------------------------------------------------------
const InputField = ({
  label,
  value,
  onChange,
  type = 'text',
  icon: Icon,
  placeholder = '',
  ...props
}) => (
  <div className="flex flex-col space-y-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <div className="relative">
      {Icon && (
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <Icon className="w-5 h-5 text-gray-400" />
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm ${
          Icon ? 'pl-10' : ''
        }`}
        {...props}
      />
    </div>
  </div>
);

// ------------------------------------------------------------------
// ✅ Helper Component: TagInput
// ------------------------------------------------------------------
const TagInput = ({ label, tags, setTags, icon: Icon }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = (e) => {
    if ((e.key === 'Enter' || e.type === 'blur') && inputValue.trim()) {
      const newTag = inputValue.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setInputValue('');
      e.preventDefault();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative border border-gray-300 rounded-lg shadow-sm focus-within:ring-indigo-500 focus-within:border-indigo-500 transition duration-150 p-1">
        {Icon && (
          <span className="absolute top-1/2 -translate-y-1/2 left-0 flex items-center pl-3">
            <Icon className="w-5 h-5 text-gray-400" />
          </span>
        )}
        <div className="flex flex-wrap gap-2 mb-1 p-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-1 rounded-full"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 text-indigo-500 hover:text-indigo-700"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleAddTag}
          onBlur={handleAddTag}
          placeholder="Type preference and press Enter"
          className={`w-full border-none focus:ring-0 p-1 ${
            Icon ? 'pl-9' : ''
          }`}
        />
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// ✅ Main Component: CompareTwoDestination
// ------------------------------------------------------------------
const CompareTwoDestination = () => {
  // --- State Management ---
  const [destinationA, setDestinationA] = useState('Bali, Indonesia');
  const [destinationB, setDestinationB] = useState('Maui, Hawaii, USA');
  const [startDate, setStartDate] = useState('2026-07-20');
  const [endDate, setEndDate] = useState('2026-07-27');
  const [preferences, setPreferences] = useState([
    'Hiking',
    'Beaches',
    'Local Food',
  ]);
  const [budget, setBudget] = useState('Mid-range');

  const [loading, setLoading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState('');
  const [error, setError] = useState(null);
  const [rawData, setRawData] = useState(null);

  // Hardcoded backend API URL
  const API_URL = 'http://localhost:4000/api/compare';

  // ------------------------------------------------------------------
  // ✅ Markdown → HTML Formatter
  // ------------------------------------------------------------------
  const formatComparisonText = (text) => {
    if (!text) return '';
    let html = text;

    // Headings
    html = html.replace(/^#+\s*(.*)$/gm, (match, content) => {
      const level = match.split(' ')[0].length;
      if (level === 3)
        return `<h3 class="text-xl font-semibold mt-4 mb-2 text-indigo-700">${content}</h3>`;
      if (level === 2)
        return `<h2 class="text-2xl font-bold mt-6 mb-3 text-teal-700">${content}</h2>`;
      return `<h4>${content}</h4>`;
    });

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // List items
    const listRegex = /^\*\s*(.*)$/gm;
    if (html.match(listRegex)) {
      html = html.replace(listRegex, '<li class="ml-4 list-disc">$1</li>');
      html = `<ul>${html}</ul>`;
      html = html.replace(/<br\/><li>/g, '<li>').replace(/<\/li><br\/>/g, '</li>');
      html = html.replace(/<ul>\s*<h/g, '</ul><h');
    }

    // Horizontal rules
    html = html.replace(/---/g, '<hr class="my-4 border-gray-300">');

    // Line breaks
    html = html.replace(/\n/g, '<br/>');

    return html;
  };

  // ------------------------------------------------------------------
  // ✅ Raw Data Formatter
  // ------------------------------------------------------------------
  const formatRawData = (data) => {
    if (!data) return 'No raw data received.';
    const d1 = data[destinationA] || {};
    const d2 = data[destinationB] || {};

    const getWeatherDisplay = (destData) => {
      const weatherSummary =
        destData.weather?.summary ||
        destData.weather?.description ||
        destData.weather?.temp;
      if (weatherSummary) return `Weather: ${weatherSummary}`;
      if (destData.weather && Object.keys(destData.weather).length > 0)
        return 'Weather: Data Received (no summary key)';
      return 'Weather: N/A';
    };

    
  };

  // ------------------------------------------------------------------
  // ✅ Submit Handler
  // ------------------------------------------------------------------
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      setComparisonResult('');
      setError(null);
      setRawData(null);

      const requestBody = {
        destinationA,
        destinationB,
        startDate,
        endDate,
        preferences,
        budget,
      };

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error || 'Server returned an unknown error.');
        }

        setComparisonResult(data.comparison);
        setRawData(data.data);
      } catch (err) {
        console.error('API Error:', err);
        setError(`Comparison Failed: ${err.message}. Check your Node.js console.`);
      } finally {
        setLoading(false);
      }
    },
    [destinationA, destinationB, startDate, endDate, preferences, budget]
  );

  // ------------------------------------------------------------------
  // ✅ Render
  // ------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <header className="w-full max-w-4xl text-center py-6">
        <h1 className="text-4xl font-extrabold text-teal-700 flex items-center justify-center">
          <Plane className="w-8 h-8 mr-3 text-teal-500" /> AI Destination Battle
        </h1>
        <p className="mt-2 text-lg text-gray-500">
          Utilizing LangChain.js and Gemini to generate a personalized,
          data-driven travel comparison.
        </p>
      </header>

      {/* --- Input Form --- */}
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Destination A"
              value={destinationA}
              onChange={setDestinationA}
              icon={MapPin}
            />
            <InputField
              label="Destination B"
              value={destinationB}
              onChange={setDestinationB}
              icon={MapPin}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              type="date"
              icon={Calendar}
            />
            <InputField
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              type="date"
              icon={Calendar}
            />
            <InputField
              label="Budget Level"
              value={budget}
              onChange={setBudget}
              placeholder="e.g., Luxury, Budget, Mid-range"
              icon={DollarSign}
            />
          </div>

          <TagInput
            label="Your Travel Preferences (Used for comparison)"
            tags={preferences}
            setTags={setPreferences}
            icon={Users}
          />

          <button
            type="submit"
            disabled={loading || preferences.length === 0}
            className="w-full py-3 px-4 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing Data and Comparing...
              </>
            ) : (
              <>
                <ArrowRightCircle className="w-5 h-5 mr-2" />
                Run AI Comparison
              </>
            )}
          </button>
        </form>
      </div>

      {/* --- Results --- */}
      <div className="w-full max-w-4xl space-y-6">
        {error && (
          <div
            className="p-4 text-sm text-red-800 bg-red-100 rounded-lg shadow-lg"
            role="alert"
          >
            <span className="font-medium">Error:</span> {error}
          </div>
        )}

        {rawData && formatRawData(rawData)}

        {comparisonResult && (
          <div className="bg-white shadow-2xl rounded-2xl p-6 border-t-4 border-teal-600">
            <h2 className="text-2xl font-bold text-teal-700 mb-4">
              AI Expert Recommendation
            </h2>
            <div
              className="prose max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: formatComparisonText(comparisonResult),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareTwoDestination;
