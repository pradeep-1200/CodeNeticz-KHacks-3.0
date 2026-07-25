import React, { useState, useEffect, useCallback } from 'react';
import { 
  Accessibility, BookOpen, PenTool, Calculator, 
  Volume2, Mic, FileText, Highlighter, 
  Binary, HelpCircle, ZoomIn, Eye, 
  Edit3, Save, X, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';
import SupportToggle from './SupportToggle';
import AccessibilityToggle from './AccessibilityToggle';
import AccessibilitySection from './AccessibilitySection';
import { getAccessibilityProfile, updateAccessibilityProfile } from '../../services/api';

const DEFAULT_PROFILE = {
  readingSupport: false,
  writingSupport: false,
  numberSupport: false,
  textToSpeech: false,
  speechToText: false,
  simplifiedReading: false,
  keywordHighlighting: false,
  visualMathAids: false,
  stepByStepHints: false,
  largeText: false,
  highContrast: false,
};

const AccessibilityProfileCard = ({ studentId, onShowToast }) => {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [formState, setFormState] = useState(DEFAULT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch accessibility profile
  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAccessibilityProfile(studentId);
      const data = res.accessibilityProfile || DEFAULT_PROFILE;
      setProfile(data);
      setFormState(data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load accessibility profile';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      fetchProfile();
    }
  }, [studentId, fetchProfile]);

  // Handle toggle changes with Business Rules auto-enable
  const handleToggleChange = (key, value) => {
    if (!isEditing) return;

    setFormState((prev) => {
      const next = { ...prev, [key]: value };

      // Business Rule 1: Reading Support auto-enables TTS, Simplified Reading, Keyword Highlighting
      if (key === 'readingSupport' && value === true) {
        next.textToSpeech = true;
        next.simplifiedReading = true;
        next.keywordHighlighting = true;
      }

      // Business Rule 2: Writing Support auto-enables Speech-to-Text
      if (key === 'writingSupport' && value === true) {
        next.speechToText = true;
      }

      // Business Rule 3: Number Support auto-enables Visual Math Aids, Step-by-Step Hints
      if (key === 'numberSupport' && value === true) {
        next.visualMathAids = true;
        next.stepByStepHints = true;
      }

      return next;
    });
  };

  const handleEdit = () => {
    setFormState(profile);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormState(profile);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updateAccessibilityProfile(studentId, formState);
      const updated = res.accessibilityProfile || formState;
      setProfile(updated);
      setFormState(updated);
      setIsEditing(false);
      if (onShowToast) {
        onShowToast('Accessibility profile saved successfully!', 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save accessibility profile';
      if (onShowToast) {
        onShowToast(msg, 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-color)] p-6 shadow-sm flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-indigo-500 mr-2" size={20} />
        <span className="text-xs font-semibold text-[var(--text-secondary)]">Loading Accessibility Profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--bg-surface)] rounded-2xl border border-red-500/20 p-6 shadow-sm">
        <div className="flex items-center gap-3 text-red-500 mb-2">
          <AlertCircle size={20} />
          <h3 className="font-extrabold text-sm">Failed to load accessibility profile</h3>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mb-4">{error}</p>
        <button
          onClick={fetchProfile}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-surface)] rounded-2xl border border-indigo-500/20 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[var(--border-color)] bg-gradient-to-r from-indigo-500/5 to-purple-500/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Accessibility size={22} />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[var(--text-primary)]">Accessibility Profile</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Configure adaptive cognitive learning tools & support modes for this student
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Edit3 size={14} /> Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 dark:bg-neutral-800 text-[var(--text-primary)] rounded-xl text-xs font-bold hover:bg-gray-300 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
            >
              <X size={14} /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">

        {/* Learning Support Section */}
        <AccessibilitySection 
          title="Learning Support" 
          description="High-level cognitive support requirements configured by teacher"
          badgeText="Support Requirements"
        >
          <div className="md:col-span-2 space-y-3">
            <SupportToggle
              id="readingSupport"
              label="Reading Support"
              description="Assists text processing. Auto-enables Text-to-Speech, Simplified Reading, & Keyword Highlighting."
              checked={formState.readingSupport}
              disabled={!isEditing}
              onChange={handleToggleChange}
              icon={BookOpen}
            />

            <SupportToggle
              id="writingSupport"
              label="Writing Support"
              description="Assists written expression. Auto-enables Speech-to-Text."
              checked={formState.writingSupport}
              disabled={!isEditing}
              onChange={handleToggleChange}
              icon={PenTool}
            />

            <SupportToggle
              id="numberSupport"
              label="Number Support"
              description="Assists numerical and mathematical logic. Auto-enables Visual Math Aids & Step-by-Step Hints."
              checked={formState.numberSupport}
              disabled={!isEditing}
              onChange={handleToggleChange}
              icon={Calculator}
            />
          </div>
        </AccessibilitySection>

        {/* Accessibility Features Section */}
        <AccessibilitySection 
          title="Accessibility Features" 
          description="Granular tools enabled during assessments and learning sessions"
        >
          <AccessibilityToggle
            id="textToSpeech"
            label="Text-to-Speech"
            description="Reads onscreen text aloud"
            checked={formState.textToSpeech}
            disabled={!isEditing}
            onChange={handleToggleChange}
            icon={Volume2}
          />

          <AccessibilityToggle
            id="speechToText"
            label="Speech-to-Text"
            description="Dictation & voice input support"
            checked={formState.speechToText}
            disabled={!isEditing}
            onChange={handleToggleChange}
            icon={Mic}
          />

          <AccessibilityToggle
            id="simplifiedReading"
            label="Simplified Reading"
            description="Simplifies complex text & sentence syntax"
            checked={formState.simplifiedReading}
            disabled={!isEditing}
            onChange={handleToggleChange}
            icon={FileText}
          />

          <AccessibilityToggle
            id="keywordHighlighting"
            label="Keyword Highlighting"
            description="Highlights key concepts and vocabulary"
            checked={formState.keywordHighlighting}
            disabled={!isEditing}
            onChange={handleToggleChange}
            icon={Highlighter}
          />

          <AccessibilityToggle
            id="visualMathAids"
            label="Visual Math Aids"
            description="Visual representations for math concepts"
            checked={formState.visualMathAids}
            disabled={!isEditing}
            onChange={handleToggleChange}
            icon={Binary}
          />

          <AccessibilityToggle
            id="stepByStepHints"
            label="Step-by-Step Hints"
            description="Scaffolded step hints for problem solving"
            checked={formState.stepByStepHints}
            disabled={!isEditing}
            onChange={handleToggleChange}
            icon={HelpCircle}
          />

          <AccessibilityToggle
            id="largeText"
            label="Large Text"
            description="Increases text size across learning screens"
            checked={formState.largeText}
            disabled={!isEditing}
            onChange={handleToggleChange}
            icon={ZoomIn}
          />

          <AccessibilityToggle
            id="highContrast"
            label="High Contrast Mode"
            description="High contrast visual mode for readability"
            checked={formState.highContrast}
            disabled={!isEditing}
            onChange={handleToggleChange}
            icon={Eye}
          />
        </AccessibilitySection>
      </div>

      {/* Footer / Status bar when editing */}
      {isEditing && (
        <div className="px-6 py-3 bg-amber-500/10 border-t border-amber-500/20 text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center justify-between">
          <span>Editing mode active. Enable support types to auto-apply recommended accessibility tools.</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-3 py-1 bg-gray-200 dark:bg-neutral-800 text-[var(--text-primary)] rounded-lg hover:bg-gray-300 dark:hover:bg-neutral-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilityProfileCard;
