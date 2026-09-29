'use client';

import { useState } from 'react';
import InteractiveCircuit from '@/components/InteractiveCircuit';
import { 
  BookOpen, 
  ShieldCheck, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Cpu, 
  RotateCcw,
  Layers
} from 'lucide-react';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const quizData: QuizQuestion[] = [
  {
    id: 1,
    question: 'Por que não ligamos o motor trifásico de 220V diretamente nas saídas do Arduino?',
    options: [
      'Porque o Arduino consome muita energia da rede elétrica.',
      'O Arduino opera em 5V DC e suporta apenas cerca de 20mA por pino, enquanto o motor consome altas correntes em 220V AC trifásico.',
      'Porque o código C++ do Arduino não suporta corrente alternada.',
      'Por causa do tipo de cabo USB utilizado.'
    ],
    correctIndex: 1,
    explanation: 'Correto! O Arduino é um circuito digital de baixa potência (5V TTL). Ligar cargas industriais diretamente destruiria o microcontrolador instantaneamente.'
  },
  {
    id: 2,
    question: 'Qual é o papel do optoacoplador presente no módulo relé?',
    options: [
      'Aumentar a velocidade do motor trifásico.',
      'Transformar corrente alternada em corrente contínua.',
      'Proporcionar isolação galvânica completa através de um feixe de luz infravermelha, protegendo o Arduino contra transientes e ruídos da rede.',
      'Inverter o sentido de rotação do motor.'
    ],
    correctIndex: 2,
    explanation: 'Exato! A isolação galvânica garante que não haja contato elétrico metálico entre o circuito de controle (5V) e o circuito de comando (24V).'
  },
  {
    id: 3,
    question: 'Qual a diferença crucial entre um Relé e um Contator eletromecânico?',
    options: [
      'O relé é apenas para corrente contínua e o contator é apenas para pilhas.',
      'O contator possui câmara de extinção de arco e contatos reforçados para suportar correntes elevadas de partida de motores, enquanto o relé é voltado para comando de pequenos sinais.',
      'Não há diferença, são exatamente o mesmo componente com nomes comerciais diferentes.',
      'O relé não possui bobina eletromagnética.'
    ],
    correctIndex: 1,
    explanation: 'Muito bem! Motores elétricos podem atingir picos de corrente de 6 a 8 vezes a corrente nominal na partida. O contator é construído para extinguir arcos voltaicos com segurança.'
  },
  {
    id: 4,
    question: 'De acordo com as boas práticas e normas de segurança (NR-10 e NR-12), o que deve acontecer ao acionar a Parada de Emergência?',
    options: [
      'O motor deve diminuir de velocidade lentamente ao longo de 5 minutos.',
      'Deve-se aguardar autorização do supervisor antes de desligar.',
      'Corte imediato e prioritário de energia para o acionador, com travamento mecânico e estado seguro garantido.',
      'Apenas acender uma lâmpada amarela mantendo o motor em rotação.'
    ],
    correctIndex: 2,
    explanation: 'Perfeito! A emergência tem precedência absoluta sobre qualquer comando de marcha e deve desenergizar os atuadores com rapidez.'
  }
];

export default function EnsinoPage() {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qId: number, optIndex: number) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qId]: optIndex }));
  };

  const calculateScore = () => {
    let score = 0;
    quizData.forEach(q => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
      {/* Cabeçalho */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>SENAI • Módulo Didático Interativo</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Fundamentos de Eletrônica de Potência
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Compreenda os conceitos essenciais que sustentam a automação de motores industriais e comandos elétricos.
        </p>
      </div>

      {/* Simulador Interativo */}
      <InteractiveCircuit />

      {/* Conteúdo Teórico Estruturado em Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Relé vs Contator */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-white">1. Relé Eletromecânico vs. Contator</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Embora ambos usem o princípio da bobina eletromagnética atraindo contatos móveis, suas aplicações são distintas:
          </p>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
            <li><strong>Relé:</strong> Destinado ao circuito de <em>comando</em> (pequenas correntes até 10A, chaveamento de sinalizadores e bobinas).</li>
            <li><strong>Contator (K1):</strong> Projetado para o circuito de <em>potência/força</em>, com câmaras para abafar o arco voltaico gerado pela partida de motores.</li>
          </ul>
        </div>

        {/* Card 2: Isolação Galvânica */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Zap className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-white">2. Isolação Galvânica & Optoacopladores</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            A isolação galvânica impede que correntes parasitas, sobretensões ou falhas no circuito de força cheguem ao microcontrolador ou ao computador do professor:
          </p>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
            <li>O sinal do Arduino acende um LED infravermelho microscópico dentro do chip optoacoplador.</li>
            <li>A luz atinge um fototransistor que comuta a alimentação da bobina do relé, sem conexão condutiva direta.</li>
          </ul>
        </div>

        {/* Card 3: Níveis de Tensão */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-white">3. Por que Comando em 24VDC?</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Na indústria e em bancadas didáticas do SENAI, utiliza-se 24VDC para o circuito de botoeiras e comando pelas seguintes razões:
          </p>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
            <li><strong>Tensão de Toque Segura:</strong> Reduz drasticamente o risco de choque elétrico grave para operadores e alunos.</li>
            <li><strong>Imunidade a Ruídos:</strong> A corrente contínua em 24V é menos suscetível a induções eletromagnéticas que cabos de sinal em 5V.</li>
          </ul>
        </div>

        {/* Card 4: Segurança NR-10 e NR-12 */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-white">4. Normas Regulamentadoras (NR-10 & NR-12)</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Requisitos mandatórios para instalações elétricas e máquinas industriais:
          </p>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
            <li><strong>NR-10:</strong> Desenergização, bloqueio mecânico (LOTO), aterramento e uso de EPIs/EPCs.</li>
            <li><strong>NR-12:</strong> Parada de emergência com retenção mecânica obrigatória, evitando religamento acidental de máquinas rotativas.</li>
          </ul>
        </div>
      </section>

      {/* Quiz Interativo para os Alunos */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Quiz de Fixação de Conteúdo</h2>
              <p className="text-xs text-slate-400">Teste seus conhecimentos sobre o acionamento eletroeletrônico</p>
            </div>
          </div>
          {submitted && (
            <div className="text-right">
              <span className="text-xs text-slate-400">Pontuação:</span>
              <div className="text-lg font-black text-amber-400">
                {calculateScore()} / {quizData.length}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {quizData.map((q, idx) => {
            const isAnswered = selectedAnswers[q.id] !== undefined;
            const isCorrect = selectedAnswers[q.id] === q.correctIndex;

            return (
              <div key={q.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
                <h3 className="text-xs sm:text-sm font-bold text-slate-200">
                  {idx + 1}. {q.question}
                </h3>

                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[q.id] === optIdx;
                    let optionStyle = 'border-slate-800 bg-slate-900/50 hover:bg-slate-800/50 text-slate-300';

                    if (submitted) {
                      if (optIdx === q.correctIndex) {
                        optionStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold';
                      } else if (isSelected && !isCorrect) {
                        optionStyle = 'border-rose-500 bg-rose-500/10 text-rose-300';
                      }
                    } else if (isSelected) {
                      optionStyle = 'border-amber-500 bg-amber-500/10 text-amber-300 font-semibold';
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelect(q.id, optIdx)}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between gap-3 ${optionStyle}`}
                      >
                        <span>{opt}</span>
                        {submitted && optIdx === q.correctIndex && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        {submitted && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {submitted && (
                  <p className="text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 mt-2">
                    💡 {q.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Botão de Enviar / Reiniciar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {!submitted ? (
            <button
              onClick={() => setSubmitted(true)}
              disabled={Object.keys(selectedAnswers).length < quizData.length}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                Object.keys(selectedAnswers).length < quizData.length
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95'
              }`}
            >
              Corrigir Respostas
            </button>
          ) : (
            <button
              onClick={resetQuiz}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Refazer Quiz</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
