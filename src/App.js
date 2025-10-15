import React, { useState, useEffect, useCallback } from 'react';
import { Home, BookOpen, FileText, Settings, Plus, Download, Trash2, Edit, Search, Play, BarChart3, Brain, Check } from 'lucide-react';
console.log('App caricata!');

function NavButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
        active ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}

function QuestionEditor({ question, onSave, onCancel, generateWithAI, hasApiKey }) {
  const [formData, setFormData] = useState({
    question: question.question || '',
    correctAnswer: question.correctAnswer || '',
    alternatives: question.alternatives || ['', '', ''],
    reference: question.reference || '',
    explanation: question.explanation || '',
    topic: question.topic || ''
  });

  const [generating, setGenerating] = useState(false);

  const handleGenerateAlternatives = async () => {
    if (!hasApiKey || !formData.question || !formData.correctAnswer) {
      return;
    }

    setGenerating(true);
    const prompt = 'Genera 3 risposte alternative plausibili ma ERRATE:\n\nDomanda: ' + formData.question + '\nRisposta corretta: ' + formData.correctAnswer + '\n\nRispondi SOLO con le 3 alternative separate da |';
    
    const result = await generateWithAI(prompt);
    if (result) {
      const alts = result.split('|').map(a => a.trim()).filter(a => a).slice(0, 3);
      if (alts.length === 3) {
        setFormData({ ...formData, alternatives: alts });
      }
    }
    setGenerating(false);
  };

  const handleGenerateHint = async () => {
    if (!hasApiKey || !formData.question) {
      return;
    }

    setGenerating(true);
    const prompt = 'Analizza questa domanda di diritto:\n\nDomanda: ' + formData.question + '\nRisposta: ' + formData.correctAnswer + '\n\nFornisci:\nRIFERIMENTO: [riferimento normativo preciso]\nHINT: [indizio che aiuta a ragionare]';
    
    const result = await generateWithAI(prompt);
    if (result) {
      const lines = result.trim().split('\n');
      const refLine = lines.find(l => l.includes('RIFERIMENTO'));
      const hintLine = lines.find(l => l.includes('HINT'));
      
      if (refLine) {
        const ref = refLine.replace('RIFERIMENTO:', '').trim();
        setFormData({ ...formData, reference: ref });
      }
      
      if (hintLine) {
        const hint = hintLine.replace('HINT:', '').trim();
        setFormData({ ...formData, explanation: hint });
      }
    }
    setGenerating(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
        <div className="p-6 space-y-4">
          <h2 className="text-2xl font-bold mb-4">
            {question.id ? 'Modifica Domanda' : 'Nuova Domanda'}
          </h2>

          <div>
            <label className="block text-sm font-medium mb-2">Domanda</label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Argomento</label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="es. Diritto Civile"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Risposta Corretta</label>
            <input
              type="text"
              value={formData.correctAnswer}
              onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Risposte Alternative</label>
              {hasApiKey && (
                <button
                  onClick={handleGenerateAlternatives}
                  disabled={generating}
                  className="flex items-center gap-1 text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 disabled:bg-gray-300"
                >
                  <Brain className="w-4 h-4" />
                  {generating ? 'Generando...' : 'Genera AI'}
                </button>
              )}
            </div>
            {formData.alternatives.map((alt, idx) => (
              <input
                key={idx}
                type="text"
                value={alt}
                onChange={(e) => {
                  const newAlts = [...formData.alternatives];
                  newAlts[idx] = e.target.value;
                  setFormData({ ...formData, alternatives: newAlts });
                }}
                className="w-full px-4 py-2 border rounded-lg mb-2"
                placeholder={'Alternativa ' + (idx + 1)}
              />
            ))}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Hint Intelligente</label>
              {hasApiKey && (
                <button
                  onClick={handleGenerateHint}
                  disabled={generating}
                  className="flex items-center gap-1 text-sm bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700 disabled:bg-gray-300"
                >
                  <Brain className="w-4 h-4" />
                  {generating ? 'Generando...' : 'Genera Hint'}
                </button>
              )}
            </div>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg mb-2"
              placeholder="Riferimento normativo"
            />
            <textarea
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              rows="2"
              placeholder="Hint intelligente..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => onSave({ ...question, ...formData })}
              disabled={!formData.question || !formData.correctAnswer}
              className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
            >
              Salva
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              Annulla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConcorsiDirittoApp() {
 const [currentView, setCurrentView] = useState('home');
const [questions, setQuestions] = useState(() => {
  const saved = localStorage.getItem('questions');
  return saved ? JSON.parse(saved) : [];
});
const [settings, setSettings] = useState(() => {
  const saved = localStorage.getItem('settings');
  return saved ? JSON.parse(saved) : { apiKey: '' };
});
const [history, setHistory] = useState(() => {
  const saved = localStorage.getItem('history');
  return saved ? JSON.parse(saved) : [];
});
const [searchTerm, setSearchTerm] = useState('');
const [selectedQuestion, setSelectedQuestion] = useState(null);
const [simulation, setSimulation] = useState(null);
const [showHint, setShowHint] = useState(false);
const [selectedTopics, setSelectedTopics] = useState([]);
const [showTopicSelector, setShowTopicSelector] = useState(false);
const [timeRemaining, setTimeRemaining] = useState(0);
const [questionToDelete, setQuestionToDelete] = useState(null);
const [importProgress, setImportProgress] = useState(null);

useEffect(() => {
  localStorage.setItem('questions', JSON.stringify(questions));
}, [questions]);

useEffect(() => {
  localStorage.setItem('settings', JSON.stringify(settings));
}, [settings]);

useEffect(() => {
  localStorage.setItem('history', JSON.stringify(history));
}, [history]);

const submitSimulation = useCallback(() => {
  if (!simulation) return;

    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    simulation.questions.forEach((q, idx) => {
      const answer = simulation.answers[idx];
      if (!answer) {
        unanswered++;
      } else if (answer === q.correctAnswer) {
        correct++;
      } else {
        wrong++;
      }
    });

    const score = (correct * 0.75) - (wrong * 0.25);
    const percentage = (correct / simulation.questions.length) * 100;

    const result = {
      id: Date.now(),
      date: new Date().toISOString(),
      score,
      correct,
      wrong,
      unanswered,
      percentage,
      totalQuestions: simulation.questions.length,
      duration: Math.floor((Date.now() - simulation.startTime) / 1000)
    };

    setHistory([result, ...history]);
    setSimulation({ ...simulation, result, timerActive: false });
   }, [simulation, history]);

useEffect(() => {
    if (!simulation || !simulation.timerActive || simulation.result) return;
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - simulation.startTime;
      const remaining = Math.max(0, simulation.timeLimit - elapsed);
      setTimeRemaining(remaining);
      
      if (remaining === 0) {
        submitSimulation();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [simulation, submitSimulation]);

  const addQuestion = (question) => {
    const newQuestion = {
      id: Date.now(),
      ...question,
      createdAt: new Date().toISOString()
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id, updatedQuestion) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updatedQuestion } : q));
  };

  const deleteQuestion = (id) => {
    const newQuestions = questions.filter(item => item.id !== id);
    setQuestions(newQuestions);
    setQuestionToDelete(null);
  };

  const exportData = (format) => {
    const dataStr = format === 'json' 
      ? JSON.stringify(questions, null, 2)
      : questions.map(q => q.question + '\n' + q.correctAnswer + '\n---\n').join('\n');
    
    const blob = new Blob([dataStr], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'banca_dati.' + (format === 'json' ? 'json' : 'txt');
    a.click();
  };
const parseSmartFormat = (data) => {
  const lines = data.split('\n').map(l => l.trim()).filter(l => l);
  const questions = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cleaned = line.replace(/^[-•*]\s*|\d+\.\s*/, '');
    
    if (cleaned.includes('?')) {
      const parts = cleaned.split('?');
      const question = parts[0].trim() + '?';
      const answer = parts[1]?.trim();
      
      if (answer) {
        questions.push({ question, correctAnswer: answer });
      }
    }
  }
  
  return questions.map((q, i) => ({
    ...q,
    id: Date.now() + i,
    alternatives: [],
    reference: '',
    explanation: '',
    topic: ''
  }));
};
  const importData = async (data, format, generateAlternatives, detectReferences, generateHints, batchTopic) => {
    try {
      let newQuestions = [];
      
      if (format === 'json') {
        const parsed = JSON.parse(data);
        newQuestions = (Array.isArray(parsed) ? parsed : [parsed]).map(q => ({ 
          ...q, 
          id: Date.now() + Math.random() 
        }));
      } else {
  const smartParsed = parseSmartFormat(data);
  newQuestions = smartParsed.map(q => ({
    ...q,
    topic: batchTopic || q.topic || '',
    createdAt: new Date().toISOString()
  }));
}
      
      if (newQuestions.length === 0) {
        setImportProgress({ type: 'error', message: 'Nessuna domanda riconosciuta' });
        return;
      }
      
      setImportProgress({ type: 'success', message: 'Riconosciute ' + newQuestions.length + ' domande' });
      
      if (settings.apiKey && newQuestions.length > 0 && (generateAlternatives || detectReferences || generateHints)) {
        setImportProgress({ 
          type: 'processing', 
          message: 'Elaborazione AI: 0 di ' + newQuestions.length,
          current: 0,
          total: newQuestions.length
        });
        
        for (let i = 0; i < newQuestions.length; i++) {
          const q = newQuestions[i];
          
          setImportProgress({ 
            type: 'processing', 
            message: 'Elaborazione AI: ' + (i + 1) + ' di ' + newQuestions.length,
            current: i + 1,
            total: newQuestions.length
          });
          
          try {
            if (generateAlternatives && (!q.alternatives || q.alternatives.length === 0)) {
              const prompt = 'Genera 3 risposte alternative ERRATE:\n\nDomanda: ' + q.question + '\nRisposta: ' + q.correctAnswer + '\n\nRispondi con 3 alternative separate da |';
              
              const result = await generateWithAI(prompt);
              if (result) {
                const alts = result.split('|').map(a => a.trim()).filter(a => a).slice(0, 3);
                newQuestions[i].alternatives = alts;
              }
              
              await new Promise(resolve => setTimeout(resolve, 800));
            }
            
            if ((detectReferences || generateHints)) {
              const prompt = 'Domanda: ' + q.question + '\nRisposta: ' + q.correctAnswer + '\n\nFornisci:\nRIFERIMENTO: [riferimento normativo]\nHINT: [indizio intelligente]';
              
              const result = await generateWithAI(prompt);
              if (result) {
                const lines = result.split('\n');
                const refLine = lines.find(l => l.includes('RIFERIMENTO'));
                const hintLine = lines.find(l => l.includes('HINT'));
                
                if (detectReferences && refLine) {
                  newQuestions[i].reference = refLine.replace('RIFERIMENTO:', '').trim();
                }
                
                if (generateHints && hintLine) {
                  newQuestions[i].explanation = hintLine.replace('HINT:', '').trim();
                }
              }
              
              await new Promise(resolve => setTimeout(resolve, 800));
            }
          } catch (error) {
            console.error('Errore:', error);
          }
        }
        
        setImportProgress({ 
          type: 'success', 
          message: 'Completato! ' + newQuestions.length + ' domande importate' 
        });
      }
      
      const updatedQuestions = [...questions, ...newQuestions];
      setQuestions(updatedQuestions);
      
      setTimeout(() => {
        setImportProgress(null);
      }, 3000);
      
    } catch (e) {
      console.error('Errore:', e);
      setImportProgress({ 
        type: 'error', 
        message: 'Errore: ' + e.message 
      });
      setTimeout(() => {
        setImportProgress(null);
      }, 5000);
    }
  };

  const generateWithAI = async (prompt) => {
  if (!settings.apiKey) return null;
  
  try {
    const response = await fetch('https://concorsi-backend.onrender.com', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        apiKey: settings.apiKey,
        prompt: prompt
      })
    });
  if (!response.ok) throw new Error('Errore API');
  const data = await response.json();
  console.log('Risposta API:', data);
  return data.content[0].text;
} catch (e) {
  console.error('Errore AI:', e);
  return null;
}
};
     


  const startSimulation = (numQuestions, topics) => {
    if (questions.length === 0) {
      return;
    }

    let availableQuestions = questions;
    if (topics && topics.length > 0) {
  if (typeof topics[0] === 'object') {
    availableQuestions = [];
    topics.forEach(t => {
      const topicQuestions = questions.filter(q => q.topic === t.topic);
      const shuffled = topicQuestions.sort(() => Math.random() - 0.5);
      availableQuestions.push(...shuffled.slice(0, t.num));
    });
  } else {
    availableQuestions = questions.filter(q => topics.includes(q.topic));
  }
  if (availableQuestions.length === 0) return;
}

    const actualNumQuestions = Math.min(numQuestions, availableQuestions.length);
    const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, actualNumQuestions);
    
    const preparedQuestions = selected.map(q => {
      const alternatives = q.alternatives || [];
      const allAnswers = [q.correctAnswer, ...alternatives].filter(a => a && a.trim());
      
      return {
        id: q.id,
        question: q.question,
        correctAnswer: q.correctAnswer,
        allAnswers: allAnswers.sort(() => Math.random() - 0.5),
        reference: q.reference || '',
        explanation: q.explanation || '',
        topic: q.topic || ''
      };
    });

setSimulation({
      questions: preparedQuestions,
      answers: {},
      currentIndex: 0,
      startTime: Date.now(),
      timeLimit: 60 * 60 * 1000,
      timerActive: true
    });
    setTimeRemaining(60 * 60 * 1000);
    setShowHint(false);
    setShowTopicSelector(false);
    setCurrentView('simulation');
  };


  const renderHome = () => {
    const topics = [...new Set(questions.map(q => q.topic).filter(t => t))];
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
            <BookOpen className="w-8 h-8 text-blue-600 mb-2" />
            <div className="text-3xl font-bold text-blue-900">{questions.length}</div>
            <div className="text-sm text-blue-700">Domande totali</div>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
            <Play className="w-8 h-8 text-green-600 mb-2" />
            <div className="text-3xl font-bold text-green-900">{history.length}</div>
            <div className="text-sm text-green-700">Simulazioni</div>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
            <BarChart3 className="w-8 h-8 text-purple-600 mb-2" />
            <div className="text-3xl font-bold text-purple-900">
              {history.length > 0 ? Math.round(history[0].percentage) : 0}%
            </div>
            <div className="text-sm text-purple-700">Ultima performance</div>
          </div>
        </div>

        {topics.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h2 className="text-xl font-bold mb-4">Argomenti disponibili</h2>
            <div className="flex flex-wrap gap-2">
              {topics.map(topic => {
                const count = questions.filter(q => q.topic === topic).length;
                return (
                  <div key={topic} className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                    <span className="font-medium text-blue-900">{topic}</span>
                    <span className="ml-2 text-blue-600">({count})</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-lg border">
          <h2 className="text-xl font-bold mb-4">Avvia Simulazione</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                const numQ = Math.min(30, questions.length);
                startSimulation(numQ, []);
              }}
              disabled={questions.length === 0}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition"
            >
              <Play className="w-5 h-5" />
              {questions.length === 0 ? 'Nessuna domanda' : 
               questions.length < 30 ? 'Simulazione Casuale (' + questions.length + ')' :
               'Simulazione Casuale (30 domande)'}
            </button>
            
            <button
              onClick={() => setShowTopicSelector(!showTopicSelector)}
              disabled={questions.length === 0 || topics.length === 0}
              className="flex items-center justify-center gap-2 bg-purple-600 text-white py-4 px-6 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 transition"
            >
              <FileText className="w-5 h-5" />
              Per Argomento
            </button>
          </div>

         {showTopicSelector && topics.length > 0 && (
  <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
    <h3 className="font-semibold mb-3">Seleziona argomenti e quantità:</h3>
    <div className="space-y-2 mb-4">
      {topics.map(topic => {
        const count = questions.filter(q => q.topic === topic).length;
        const selected = selectedTopics.find(t => t.topic === topic);
        return (
          <div key={topic} className="flex items-center gap-3 p-2 hover:bg-white rounded">
            <input
              type="checkbox"
              checked={!!selected}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedTopics([...selectedTopics, {topic, num: 5}]);
                } else {
                  setSelectedTopics(selectedTopics.filter(t => t.topic !== topic));
                }
              }}
              className="w-4 h-4"
            />
            <span className="flex-1 font-medium">{topic}</span>
            {selected && (
              <input
                type="number"
                min="1"
                max={count}
                value={selected.num}
                onChange={(e) => {
                  const newTopics = selectedTopics.map(t => 
                    t.topic === topic ? {...t, num: parseInt(e.target.value) || 1} : t
                  );
                  setSelectedTopics(newTopics);
                }}
                className="w-20 px-2 py-1 border rounded"
              />
            )}
            <span className="text-sm text-gray-600">({count} disponibili)</span>
          </div>
        );
      })}
    </div>
    <button
      onClick={() => {
        if (selectedTopics.length === 0) return;
        const total = selectedTopics.reduce((sum, t) => sum + t.num, 0);
        startSimulation(total, selectedTopics);
      }}
      disabled={selectedTopics.length === 0}
      className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:bg-gray-300"
    >
      Avvia Simulazione
    </button>
  </div>
)}
        </div>

        {history.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h2 className="text-xl font-bold mb-4">Storico Progressi</h2>
            <div className="space-y-3">
              {history.slice(0, 5).map(h => (
                <div key={h.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-semibold">Punteggio: {h.score.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(h.date).toLocaleDateString()} - {h.correct}/{h.totalQuestions} corrette
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${h.percentage >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                    {h.percentage.toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderQuestions = () => {
    const filteredQuestions = questions.filter(q =>
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.reference && q.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (q.topic && q.topic.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca domande..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <button
            onClick={() => setSelectedQuestion({})}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Nuova
          </button>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow border text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Nessuna domanda</h3>
            <button
              onClick={() => setSelectedQuestion({})}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Crea Prima Domanda
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredQuestions.map(q => (
              <div key={q.id} className="bg-white p-4 rounded-lg shadow border hover:shadow-md transition">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    {q.topic && (
                      <div className="text-xs text-blue-600 font-medium mb-1">📂 {q.topic}</div>
                    )}
                    <h3 className="font-semibold text-lg mb-2">{q.question}</h3>
                    <div className="text-green-600 font-medium mb-2">✓ {q.correctAnswer}</div>
                    {q.alternatives && q.alternatives.filter(a => a).length > 0 && (
                      <div className="text-sm text-gray-600 mb-2">
                        Alternative: {q.alternatives.filter(a => a).join(' | ')}
                      </div>
                    )}
                    {q.reference && (
                      <div className="text-sm text-blue-600 mb-2">📚 {q.reference}</div>
                    )}
                    {q.explanation && (
                      <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">💡 {q.explanation}</div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedQuestion(q);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setQuestionToDelete(q);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded border border-red-200"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedQuestion && (
          <QuestionEditor
            question={selectedQuestion}
            onSave={(q) => {
              if (q.id) {
                updateQuestion(q.id, q);
              } else {
                addQuestion(q);
              }
              setSelectedQuestion(null);
            }}
            onCancel={() => setSelectedQuestion(null)}
            generateWithAI={generateWithAI}
            hasApiKey={!!settings.apiKey}
          />
        )}

        {questionToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-red-600 mb-4">Conferma Eliminazione</h3>
              <p className="text-gray-700 mb-2">Sei sicuro di voler eliminare questa domanda?</p>
              <div className="bg-gray-50 p-3 rounded-lg mb-6 max-h-32 overflow-y-auto">
                <p className="text-sm font-medium">{questionToDelete.question}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => deleteQuestion(questionToDelete.id)}
                  className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 font-medium"
                >
                  Si, Elimina
                </button>
                <button
                  onClick={() => setQuestionToDelete(null)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 font-medium"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSimulation = () => {
    if (!simulation) return null;

    if (simulation.result) {
      const r = simulation.result;
      const wrongAnswers = simulation.questions.filter((q, idx) => {
        const userAnswer = simulation.answers[idx];
        return userAnswer && userAnswer !== q.correctAnswer;
      });
      
      return (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white p-8 rounded-lg shadow-lg border text-center">
            <h2 className="text-3xl font-bold mb-6">Risultati</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <div className="text-4xl font-bold text-green-600">{r.score.toFixed(2)}</div>
                <div className="text-sm text-green-700">Punteggio</div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <div className="text-4xl font-bold text-blue-600">{r.percentage.toFixed(1)}%</div>
                <div className="text-sm text-blue-700">Corrette</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-2xl font-bold text-green-600">{r.correct}</div>
                <div className="text-xs text-gray-600">Corrette</div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-2xl font-bold text-red-600">{r.wrong}</div>
                <div className="text-xs text-gray-600">Errate</div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-2xl font-bold text-gray-600">{r.unanswered}</div>
                <div className="text-xs text-gray-600">Non Risposte</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  const numQ = Math.min(30, questions.length);
                  startSimulation(numQ, []);
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Nuova Simulazione
              </button>
              <button
                onClick={() => {
                  setSimulation(null);
                  setShowHint(false);
                  setCurrentView('home');
                }}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
              >
                Home
              </button>
            </div>
          </div>

          {wrongAnswers.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-lg border">
              <h3 className="text-2xl font-bold text-red-600 mb-4">
                Risposte Errate ({wrongAnswers.length})
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Studia attentamente gli errori per migliorare
              </p>
              <div className="space-y-4">
                {simulation.questions.map((q, idx) => {
                  const userAnswer = simulation.answers[idx];
                  const isWrong = userAnswer && userAnswer !== q.correctAnswer;
                  
                  if (!isWrong) return null;
                  
                  return (
                    <div key={'wrong-' + idx} className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                      <div className="mb-3">
                        <span className="inline-block bg-red-600 text-white text-xs font-bold px-2 py-1 rounded mb-2">
                          DOMANDA {idx + 1}
                        </span>
                        {q.topic && (
                          <span className="inline-block ml-2 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded">
                            📂 {q.topic}
                          </span>
                        )}
                      </div>
                      
                      <h4 className="font-bold text-lg text-gray-900 mb-3">{q.question}</h4>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-start gap-2">
                          <span className="text-red-600 font-bold mt-1">✗</span>
                          <div className="flex-1">
                            <span className="text-sm font-semibold text-red-700">La tua risposta:</span>
                            <p className="text-red-800 font-medium">{userAnswer}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <span className="text-green-600 font-bold mt-1">✓</span>
                          <div className="flex-1">
                            <span className="text-sm font-semibold text-green-700">Risposta corretta:</span>
                            <p className="text-green-800 font-bold text-lg">{q.correctAnswer}</p>
                          </div>
                        </div>
                      </div>
                      
                      {q.reference && (
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3">
                          <div className="flex items-start gap-2">
                            <span className="text-lg">📚</span>
                            <div>
                              <p className="text-xs font-semibold text-blue-900 mb-1">RIFERIMENTO NORMATIVO</p>
                              <p className="text-blue-800 font-medium">{q.reference}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {q.explanation && (
                        <div className="bg-amber-50 border-l-4 border-amber-400 p-3">
                          <div className="flex items-start gap-2">
                            <span className="text-lg">💡</span>
                            <div>
                              <p className="text-xs font-semibold text-amber-900 mb-1">SPIEGAZIONE</p>
                              <p className="text-amber-900">{q.explanation}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    const currentQ = simulation.questions[simulation.currentIndex];
    const isLast = simulation.currentIndex === simulation.questions.length - 1;
    const currentAnswer = simulation.answers[simulation.currentIndex];
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);

    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-lg border">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              Domanda {simulation.currentIndex + 1} di {simulation.questions.length}
            </div>
            <div className={'text-lg font-bold ' + (minutes < 10 ? 'text-red-600' : 'text-blue-600')}>
              ⏱️ {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-600">
              Risposte: {Object.keys(simulation.answers).length}
            </div>
            {currentQ.topic && (
              <div className="text-sm text-blue-600 font-medium">
                📂 {currentQ.topic}
              </div>
            )}
          </div>

          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: ((simulation.currentIndex + 1) / simulation.questions.length * 100) + '%' }}
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6">{currentQ.question}</h2>

          {(currentQ.reference || currentQ.explanation) && (
            <div className="mb-6">
              {!showHint ? (
                <button
                  onClick={() => setShowHint(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border-2 border-amber-200 rounded-lg hover:bg-amber-100 transition"
                >
                  <span className="text-lg">💡</span>
                  <span className="font-medium">Mostra Hint</span>
                </button>
              ) : (
                <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div className="flex-1">
                      {currentQ.reference && (
                        <div className="mb-2">
                          <div className="font-semibold text-amber-900 text-sm">📚 Riferimento</div>
                          <div className="text-amber-800 font-medium">{currentQ.reference}</div>
                        </div>
                      )}
                      {currentQ.explanation && (
                        <div>
                          <div className="font-semibold text-amber-900 text-sm">💭 Indizio</div>
                          <div className="text-amber-800">{currentQ.explanation}</div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setShowHint(false)}
                      className="text-amber-600 hover:text-amber-800 text-sm font-medium"
                    >
                      Nascondi
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3 mb-6">
            {currentQ.allAnswers.map((answer, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = currentAnswer === answer;
              
              return (
                <button
                  key={'answer-' + simulation.currentIndex + '-' + idx}
                  onClick={() => {
                    setSimulation({
                      ...simulation,
                      answers: { ...simulation.answers, [simulation.currentIndex]: answer }
                    });
                  }}
                  className={'w-full text-left p-4 rounded-lg border-2 transition ' + (isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-400')}
                >
                  <span className="font-semibold mr-2">{letter}.</span>
                  {answer}
                </button>
              );
            })}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setSimulation({ ...simulation, currentIndex: Math.max(0, simulation.currentIndex - 1) });
                setShowHint(false);
              }}
              disabled={simulation.currentIndex === 0}
              className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed"
            >
              Precedente
            </button>
            
            {!isLast ? (
              <button
                onClick={() => {
                  setSimulation({ ...simulation, currentIndex: simulation.currentIndex + 1 });
                  setShowHint(false);
                }}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Successiva
              </button>
            ) : (
              <button
                onClick={() => {
                  submitSimulation();
                  setShowHint(false);
                }}
                className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Termina
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      {importProgress && (
        <div className={'p-4 rounded-lg border-2 ' + (
          importProgress.type === 'success' ? 'bg-green-50 border-green-300' :
          importProgress.type === 'error' ? 'bg-red-50 border-red-300' :
          'bg-blue-50 border-blue-300'
        )}>
          <div className="flex items-center gap-3">
            {importProgress.type === 'processing' && (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            )}
            <div className="flex-1">
              <p className={'font-semibold ' + (
                importProgress.type === 'success' ? 'text-green-900' :
                importProgress.type === 'error' ? 'text-red-900' :
                'text-blue-900'
              )}>
                {importProgress.message}
              </p>
              {importProgress.total && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: ((importProgress.current / importProgress.total) * 100) + '%' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-lg border">
        <h2 className="text-xl font-bold mb-4">Integrazione AI</h2>
        <div>
          <label className="block text-sm font-medium mb-2">API Key Anthropic</label>
          <input
            type="password"
            value={settings.apiKey}
            onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
            placeholder="sk-ant-..."
            className="w-full px-4 py-2 border rounded-lg"
          />
          <p className="text-xs text-gray-600 mt-1">
            Ottieni la chiave su console.anthropic.com
          </p>
        </div>
        {settings.apiKey && (
          <div className="flex items-center gap-2 text-green-600 mt-2">
            <Check className="w-5 h-5" />
            <span className="text-sm">AI configurata</span>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg border">
        <h2 className="text-xl font-bold mb-4">Import / Export</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Importa Domande</label>
            <div className="mb-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs">
              <p className="text-blue-900 font-medium mb-2">Formato supportato:</p>
              <pre className="text-blue-800 bg-white p-2 rounded">
Domanda uno?
Risposta corretta

Domanda due?
Risposta corretta due
              </pre>
              <p className="text-blue-700 mt-2">
                Una domanda e risposta per coppia, separate da riga vuota
              </p>
            </div>
            
            <div className="space-y-3">
              <input
                type="file"
                accept=".txt,.json"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const content = event.target.result;
                      const format = file.name.endsWith('.json') ? 'json' : 'text';
                      document.getElementById('importText').value = content;
                      document.getElementById('importFormat').value = format;
                    };
                    reader.readAsText(file);
                  }
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                id="fileInput"
              />
              
              <textarea
                placeholder="Oppure incolla qui..."
                className="w-full px-4 py-2 border rounded-lg h-32"
                id="importText"
              />
              
              <input type="hidden" id="importFormat" value="text" />
              
              <div>
                <label className="block text-sm font-medium mb-2">Argomento per tutte</label>
                <input
                  type="text"
                  id="batchTopic"
                  placeholder="es. Diritto Civile"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              
              <div className="space-y-2 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="font-semibold text-purple-900 text-sm mb-2">Opzioni AI</p>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="generateAlts"
                    className="w-4 h-4"
                    disabled={!settings.apiKey}
                  />
                  <span className="text-sm text-purple-900 flex-1">
                    <strong>Genera alternative</strong>
                  </span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="detectRefs"
                    className="w-4 h-4"
                    disabled={!settings.apiKey}
                  />
                  <span className="text-sm text-purple-900 flex-1">
                    <strong>Individua riferimenti normativi</strong>
                  </span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="generateHints"
                    className="w-4 h-4"
                    disabled={!settings.apiKey}
                  />
                  <span className="text-sm text-purple-900 flex-1">
                    <strong>Genera hint intelligenti</strong>
                  </span>
                </label>
                
                {!settings.apiKey && (
                  <p className="text-xs text-purple-700 mt-2 bg-purple-100 p-2 rounded">
                    Configura API Key per usare AI
                  </p>
                )}
              </div>
              
              <button
                onClick={async () => {
                  const text = document.getElementById('importText').value;
                  const format = document.getElementById('importFormat').value;
                  const generateAlts = document.getElementById('generateAlts').checked;
                  const detectRefs = document.getElementById('detectRefs').checked;
                  const generateHintsCheck = document.getElementById('generateHints').checked;
                  const batchTopic = document.getElementById('batchTopic').value.trim();
                  
                  if (text) {
                    await importData(text, format, generateAlts, detectRefs, generateHintsCheck, batchTopic);
                    document.getElementById('importText').value = '';
                    document.getElementById('fileInput').value = '';
                    document.getElementById('batchTopic').value = '';
                  }
                }}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Importa Domande
              </button>
            </div>
          </div>

          <div className="border-t pt-4">
            <label className="block text-sm font-medium mb-2">Esporta</label>
            <div className="flex gap-2">
              <button
                onClick={() => exportData('json')}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                JSON
              </button>
              <button
                onClick={() => exportData('text')}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                TXT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Concorsi Diritto</span>
            </div>
            <div className="flex gap-2">
              <NavButton
                icon={<Home className="w-5 h-5" />}
                label="Home"
                active={currentView === 'home'}
                onClick={() => setCurrentView('home')}
              />
              <NavButton
                icon={<FileText className="w-5 h-5" />}
                label="Domande"
                active={currentView === 'questions'}
                onClick={() => setCurrentView('questions')}
              />
              <NavButton
                icon={<Settings className="w-5 h-5" />}
                label="Impostazioni"
                active={currentView === 'settings'}
                onClick={() => setCurrentView('settings')}
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'home' && renderHome()}
        {currentView === 'questions' && renderQuestions()}
        {currentView === 'simulation' && renderSimulation()}
        {currentView === 'settings' && renderSettings()}
      </main>
    </div>
  );
}