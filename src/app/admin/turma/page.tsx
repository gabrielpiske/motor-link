'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ref, update } from 'firebase/database';
import { db } from '@/lib/firebase';
import { rtdb } from '@/lib/firebase-v2';
import { useAuth } from '@/contexts/AuthContext';
import { RouteGuard } from '@/components/RouteGuard';
import { Users, UserCog, Layers, Radio, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface Student {
  uid: string;
  email: string;
  displayName?: string;
  assignedPanel?: string | null;
}

export default function TurmaPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const panels = Array.from({ length: 12 }, (_, i) => `panel-${i + 1}`);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    if (!db) {
      setMessage({ type: 'error', text: 'Banco de dados não inicializado.' });
      setLoading(false);
      return;
    }

    try {
      const q = query(collection(db, 'users'), where('role', '==', 'student'));
      const querySnapshot = await getDocs(q);
      const studentsData: Student[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        studentsData.push({
          uid: docSnap.id,
          email: data.email,
          displayName: data.displayName,
          assignedPanel: data.assignedPanel,
        });
      });
      setStudents(studentsData);
    } catch (error: any) {
      console.error("Erro ao buscar alunos:", error);
      setMessage({ type: 'error', text: 'Erro ao carregar lista de alunos.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPanel = async (studentUid: string, newPanelId: string) => {
    if (!db || !rtdb) {
      setMessage({ type: 'error', text: 'Serviço de banco de dados indisponível.' });
      return;
    }

    setSaving(studentUid);
    setMessage(null);

    try {
      const student = students.find(s => s.uid === studentUid);
      if (!student) throw new Error("Aluno não encontrado");

      const oldPanelId = student.assignedPanel;

      // Update Firestore user document
      await updateDoc(doc(db, 'users', studentUid), {
        assignedPanel: newPanelId === 'none' ? null : newPanelId,
        updatedAt: new Date().toISOString()
      });

      // Update old panel in RTDB (clear it)
      if (oldPanelId && oldPanelId !== 'none' && oldPanelId !== newPanelId) {
        await update(ref(rtdb, `panels/${oldPanelId}/meta`), {
          assignedStudentUid: null,
          assignedStudentName: null
        });
      }

      // Update new panel in RTDB
      if (newPanelId !== 'none') {
        // Find if any other student was assigned to this panel and clear them locally
        const displacedStudent = students.find(s => s.assignedPanel === newPanelId);
        if (displacedStudent && displacedStudent.uid !== studentUid) {
          await updateDoc(doc(db, 'users', displacedStudent.uid), {
            assignedPanel: null,
            updatedAt: new Date().toISOString()
          });
        }

        await update(ref(rtdb, `panels/${newPanelId}/meta`), {
          assignedStudentUid: studentUid,
          assignedStudentName: student.displayName || student.email || 'Aluno'
        });
      }

      // Refresh students list to reflect changes
      await fetchStudents();
      setMessage({ type: 'success', text: 'Atribuição atualizada com sucesso!' });
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error("Erro ao atualizar bancada:", error);
      setMessage({ type: 'error', text: 'Erro ao atualizar a bancada.' });
    } finally {
      setSaving(null);
    }
  };

  return (
    <RouteGuard requiredRole="admin">
      <div className="min-h-screen bg-slate-950 text-slate-200 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <header className="flex items-center space-x-4 border-b border-slate-800 pb-6">
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <UserCog className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Gerenciamento de Turma</h1>
              <p className="text-slate-400">Administre os alunos e as atribuições de bancadas</p>
            </div>
          </header>

          {message && (
            <div className={`p-4 rounded-lg flex items-center space-x-3 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span>{message.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Student List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center space-x-2 mb-6">
                <Users className="w-6 h-6 text-amber-500" />
                <h2 className="text-xl font-semibold text-white">Lista de Alunos</h2>
              </div>

              {loading ? (
                <div className="text-slate-400 animate-pulse">Carregando alunos...</div>
              ) : students.length === 0 ? (
                <div className="text-slate-400 bg-slate-900 p-4 rounded-lg border border-slate-800">
                  Nenhum aluno registrado.
                </div>
              ) : (
                <div className="space-y-4">
                  {students.map((student) => (
                    <div key={student.uid} className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
                      <div className="font-medium text-white mb-1">{student.displayName || 'Sem nome'}</div>
                      <div className="text-sm text-slate-400 mb-4 truncate">{student.email}</div>
                      
                      <div className="flex flex-col space-y-2">
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Atribuir Bancada
                        </label>
                        <select
                          className="bg-slate-950 border border-slate-700 text-slate-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent w-full text-sm disabled:opacity-50"
                          value={student.assignedPanel || 'none'}
                          onChange={(e) => handleAssignPanel(student.uid, e.target.value)}
                          disabled={saving === student.uid}
                        >
                          <option value="none">Nenhuma Bancada</option>
                          {panels.map((panel) => {
                            const isAssignedToOther = students.some(s => s.uid !== student.uid && s.assignedPanel === panel);
                            return (
                              <option key={panel} value={panel}>
                                {panel.replace('panel-', 'Bancada ')} {isAssignedToOther ? '(Ocupada)' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Panel Map */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center space-x-2 mb-6">
                <Layers className="w-6 h-6 text-amber-500" />
                <h2 className="text-xl font-semibold text-white">Mapa de Bancadas</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {panels.map((panel) => {
                  const assignedStudent = students.find(s => s.assignedPanel === panel);
                  
                  return (
                    <div 
                      key={panel} 
                      className={`relative overflow-hidden rounded-xl border p-5 transition-all
                        ${assignedStudent 
                          ? 'bg-amber-500/5 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]' 
                          : 'bg-slate-900 border-slate-800'}
                      `}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-slate-300">
                          {panel.replace('panel-', 'BANCADA ')}
                        </span>
                        <Radio className={`w-4 h-4 ${assignedStudent ? 'text-amber-500' : 'text-slate-600'}`} />
                      </div>
                      
                      {assignedStudent ? (
                        <div className="flex items-start space-x-2 mt-2">
                          <ArrowRight className="w-4 h-4 text-amber-500/70 mt-0.5 shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-amber-400 line-clamp-1">
                              {assignedStudent.displayName || 'Sem nome'}
                            </div>
                            <div className="text-xs text-slate-500 line-clamp-1">
                              {assignedStudent.email}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 mt-2 text-slate-500">
                          <div className="text-sm">Livre</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
