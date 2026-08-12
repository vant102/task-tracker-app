import { collection, doc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";
import { dbFirestore, auth } from "../firebase";
import { useFirestoreQuery } from "../hooks/useFirestoreQuery";

// Helpers
const getUserId = () => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Chưa đăng nhập!");
  return uid;
};

const getCollection = (colName) => collection(dbFirestore, colName);

// --- CÁC HOOK LẤY DỮ LIỆU THỜI GIAN THỰC (Dùng trong Components) ---

export function useProjects() {
  const uid = auth.currentUser?.uid;
  const q = uid ? query(getCollection('projects'), where('userId', '==', uid)) : null;
  return useFirestoreQuery(q, [uid]);
}

export function useTasks() {
  const uid = auth.currentUser?.uid;
  const q = uid ? query(getCollection('tasks'), where('userId', '==', uid)) : null;
  return useFirestoreQuery(q, [uid]);
}

export function useProjectTasks(projectId) {
  const uid = auth.currentUser?.uid;
  const q = (uid && projectId) ? query(getCollection('tasks'), where('userId', '==', uid), where('project_id', '==', projectId)) : null;
  return useFirestoreQuery(q, [uid, projectId]);
}

export function useProjectLogs(projectId) {
  const uid = auth.currentUser?.uid;
  const q = (uid && projectId) ? query(getCollection('project_logs'), where('userId', '==', uid), where('project_id', '==', projectId)) : null;
  const data = useFirestoreQuery(q, [uid, projectId]);
  return data ? [...data].sort((a, b) => new Date(b.date) - new Date(a.date)) : null;
}

// --- CÁC HÀM GHI DỮ LIỆU ---

// Tasks
export async function addTask(taskData) {
  return await addDoc(getCollection('tasks'), {
    ...taskData,
    userId: getUserId(),
    status: taskData.status || 'To do',
    parent_id: taskData.parent_id || null,
    createdAt: new Date().toISOString()
  });
}

export async function updateTask(id, changes) {
  const docRef = doc(dbFirestore, 'tasks', id);
  return await updateDoc(docRef, changes);
}

export async function deleteTask(id) {
  const docRef = doc(dbFirestore, 'tasks', id);
  return await deleteDoc(docRef);
}

// Projects
export async function addProject(projectData) {
  return await addDoc(getCollection('projects'), {
    ...projectData,
    userId: getUserId(),
    status: projectData.status || 'Đang thực hiện',
    createdAt: new Date().toISOString()
  });
}

export async function updateProject(id, changes) {
  const docRef = doc(dbFirestore, 'projects', id);
  return await updateDoc(docRef, changes);
}

export async function deleteProject(id) {
  // Lưu ý: Firebase không có tự động xóa khóa ngoại (cascade delete). 
  // Để hoàn hảo, ta nên query các task thuộc project này rồi xóa. 
  // Ở đây ta tạm xóa project trước.
  const docRef = doc(dbFirestore, 'projects', id);
  return await deleteDoc(docRef);
}

// Project Logs
export async function addProjectLog(logData) {
  return await addDoc(getCollection('project_logs'), {
    ...logData,
    userId: getUserId(),
    date: logData.date || new Date().toISOString()
  });
}

export async function updateProjectLog(id, changes) {
  const docRef = doc(dbFirestore, 'project_logs', id);
  return await updateDoc(docRef, changes);
}

export async function deleteProjectLog(id) {
  const docRef = doc(dbFirestore, 'project_logs', id);
  return await deleteDoc(docRef);
}
