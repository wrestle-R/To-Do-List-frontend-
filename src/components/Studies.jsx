import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { db } from "../firebaseConfig";
import { motion } from "framer-motion";

import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where
} from "firebase/firestore";

export default function ExpandingSidePanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  // Fetch tasks in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "tasks"), (snapshot) => {
      const tasksList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(tasksList);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // Add Task
  const addTask = async (e) => {
    e.preventDefault();
    if (task.trim() === "") {
      alert("Task cannot be empty!");
      return;
    }
  
    try {
      // Check if the task already exists in the database
      const tasksQuery = query(collection(db, "tasks"), where("task", "==", task));
      const querySnapshot = await getDocs(tasksQuery);
  
      if (!querySnapshot.empty) {
        alert("Task already exists!");
        return;
      }
  
      // Add the new task if it doesn't exist
      await addDoc(collection(db, "tasks"), {
        task: task,
        timestamp: new Date(),
      });
      setTask(""); // Clear input field
    } catch (error) {
      console.error("Error adding task: ", error);
    }
  };
  

  // Remove Task
  const removeTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      
    } catch (error) {
      console.error("Error removing task: ", error);
    }
  };

  const [subject, setSubject] = useState("");
    const [subjectArr, setSubjectArr] = useState([]);
    const [resourceInputs, setResourceInputs] = useState({});
    const [resourcesBySubject, setResourcesBySubject] = useState({});
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          // Fetch subjects
          const studiesSnapshot = await getDocs(collection(db, "studies"));
          const studies = studiesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
          // Fetch resources
          const resourcesSnapshot = await getDocs(collection(db, "resources"));
          const resources = resourcesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
          // Map resources to their respective subjects
          const studyMap = studies.reduce((acc, study) => {
            acc[study.subject] = [];
            return acc;
          }, {});
  
          resources.forEach((resource) => {
            const study = studies.find((s) => s.id === resource.subject_id);
            if (study) {
              studyMap[study.subject].push(resource.title);
            }
          });
  
          setSubjectArr(studies.map((study) => study.subject));
          setResourcesBySubject(studyMap);
  
          // Initialize resource inputs for each subject
          const initialResourceInputs = studies.reduce((acc, study) => {
            acc[study.subject] = "";
            return acc;
          }, {});
          setResourceInputs(initialResourceInputs);
        } catch (err) {
          console.error("Error fetching data:", err);
        }
      };
  
      fetchData();
    }, []);
  
    const addSubject = async (e) => {
      e.preventDefault();
      if (!subject) return;
    
      try {
        // Check if the subject already exists
        const subjectQuery = query(collection(db, "studies"), where("subject", "==", subject));
        const subjectSnapshot = await getDocs(subjectQuery);
    
        if (!subjectSnapshot.empty) {
          alert("Subject already exists!");
          return;
        }
    
        // Add the new subject if it doesn't exist
        const docRef = await addDoc(collection(db, "studies"), { subject });
        setSubjectArr([...subjectArr, subject]);
        setResourcesBySubject({ ...resourcesBySubject, [subject]: [] });
    
        // Add a resource input for the new subject
        setResourceInputs({ 
          ...resourceInputs, 
          [subject]: "" 
        });
    
        setSubject(""); // Clear the subject input
      } catch (err) {
        console.error("Error adding subject:", err);
      }
    };
    const addResource = async (e, subject) => {
      e.preventDefault();
      const resource = resourceInputs[subject];
      if (!resource) return;
    
      try {
        // Check if the resource already exists for the subject
        const studiesQuery = query(collection(db, "studies"), where("subject", "==", subject));
        const studySnapshot = await getDocs(studiesQuery);
        if (studySnapshot.empty) throw new Error("Subject not found");
    
        const subjectId = studySnapshot.docs[0].id;
    
        const resourceQuery = query(
          collection(db, "resources"),
          where("subject_id", "==", subjectId),
          where("title", "==", resource)
        );
        const resourceSnapshot = await getDocs(resourceQuery);
    
        if (!resourceSnapshot.empty) {
          alert("Resource already exists for this subject!");
          return;
        }
    
        // Add the new resource if it doesn't exist
        await addDoc(collection(db, "resources"), { subject_id: subjectId, title: resource });
    
        setResourcesBySubject({
          ...resourcesBySubject,
          [subject]: [...resourcesBySubject[subject], resource],
        });
    
        // Clear the resource input for the specific subject
        setResourceInputs({
          ...resourceInputs,
          [subject]: "",
        });
      } catch (err) {
        console.error("Error adding resource:", err);
      }
    };
        
  
    const removeSubject = async (subjectToRemove) => {
      try {
        // Step 1: Query the subject from Firestore
        const studiesQuery = query(collection(db, "studies"), where("subject", "==", subjectToRemove));
        const studySnapshot = await getDocs(studiesQuery);
    
        if (studySnapshot.empty) {
          throw new Error("Subject not found");
        }
    
        // Step 2: Get the subject ID
        const subjectId = studySnapshot.docs[0].id;
    
        // Step 3: Query and delete all resources linked to the subject
        const resourcesQuery = query(collection(db, "resources"), where("subject_id", "==", subjectId));
        const resourcesSnapshot = await getDocs(resourcesQuery);
    
        const deletePromises = resourcesSnapshot.docs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(deletePromises); // Delete all resources
    
        // Step 4: Delete the subject itself
        await deleteDoc(studySnapshot.docs[0].ref);
    
        // Step 5: Update local state
        setSubjectArr(subjectArr.filter((subject) => subject !== subjectToRemove));
        const updatedResources = { ...resourcesBySubject };
        delete updatedResources[subjectToRemove];
        setResourcesBySubject(updatedResources);
  
        // Remove resource input for deleted subject
        const updatedResourceInputs = { ...resourceInputs };
        delete updatedResourceInputs[subjectToRemove];
        setResourceInputs(updatedResourceInputs);
      } catch (err) {
        console.error("Error removing subject:", err);
      }
    };
    
    const removeResource = async (subject, resourceTitle) => {
      try {
        const studiesQuery = query(collection(db, "studies"), where("subject", "==", subject));
        const studySnapshot = await getDocs(studiesQuery);
    
        if (studySnapshot.empty) {
          throw new Error("Subject not found");
        }
    
        const subjectId = studySnapshot.docs[0].id;
    
        const resourcesQuery = query(
          collection(db, "resources"),
          where("subject_id", "==", subjectId),
          where("title", "==", resourceTitle)
        );
        const resourceSnapshot = await getDocs(resourcesQuery);
    
        if (resourceSnapshot.empty) {
          throw new Error("Resource not found");
        }
    
        await deleteDoc(resourceSnapshot.docs[0].ref);
    
        setResourcesBySubject((prevState) => ({
          ...prevState,
          [subject]: prevState[subject].filter((r) => r !== resourceTitle),
        }));
      } catch (err) {
        console.error("Error removing resource:", err);
      }
    };
    

  return (
      <div className="flex h-screen w-full">
        <aside
          className={`fixed left-0 top-0 z-50 h-full transition-all duration-300 ease-in-out bg-white border-r border-slate-100 shadow-xl ${
            isExpanded ? "w-84" : "w-10"
          }`}
        >
          <div className="h-full flex flex-col relative">
            {/* Sidebar Header */}
            <div className="h-16 flex items-center justify-between px-4">
              <div 
                className={`flex items-center space-x-3 transition-opacity duration-300 ${
                  isExpanded ? "opacity-100" : "opacity-0"
                }`}
              >
                <span className="text-xl font-bold text-indigo-600">Daily Workflow</span>
              </div>
            </div>

            {/* Add Task Form */}
            {isExpanded && (
              <div className="px-4 py-4">
                <form onSubmit={addTask} className="space-y-4">
                  <div>
                    <label htmlFor="task" className="block text-sm font-medium text-slate-600 mb-2">
                      Create New Task
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        id="task"
                        value={task}
                        onChange={(e) => setTask(e.target.value)}
                        placeholder="What needs to be done?"
                        className="flex-grow px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="submit"
                        className="bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Task List */}
            {isExpanded && (
              <div className="px-4 py-2 flex-grow overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4 text-slate-700">Active Tasks</h2>
                {tasks.length === 0 ? (
                  <p className="text-slate-400 text-center">No tasks yet</p>
                ) : (
                  <ul className="space-y-3">
                    {tasks.map((task) => (
                      <motion.li
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-lg border border-slate-100"
                      >
                        <span className="text-slate-800 flex-grow truncate mr-2">{task.task}</span>
                        <button
                          onClick={() => removeTask(task.id)}
                          className="text-red-500 hover:text-red-600 bg-red-50 px-2 py-1 rounded-md"
                        >
                          Remove
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Sidebar Footer */}
            {isExpanded && (
              <div className="px-4 py-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Total Tasks: {tasks.length}</span>
                </div>
              </div>
            )}

            {/* Toggle Button */}
            <button
              onClick={toggleExpansion}
              className="absolute top-1/2 transform -translate-y-1/2 -right-4 w-8 h-12 bg-white border border-slate-100 shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors rounded-r-lg"
              aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isExpanded ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </aside>

      {/* Main Content */}
      
      <div className="min-h-screen w-full flex flex-col items-center justify-start bg-gradient-to-br from-slate-50 to-white px-4 py-10 font-inter">
  <div className="max-w-5xl mx-auto">
    <motion.header 
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-16"
    >
      <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
        Study Resource Manager
      </h1>
      <p className="text-xl text-slate-500 max-w-2xl mx-auto">
        Curate and organize your study resources with precision and style
      </p>
    </motion.header>

    <motion.form
      onSubmit={addSubject}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto mb-16 bg-white shadow-2xl rounded-2xl p-8 border border-slate-100"
    >
      <div className="flex space-x-4">
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter a new study subject"
          className="flex-grow px-5 py-4 text-lg border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all duration-300"
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 rounded-xl hover:shadow-xl transition-all duration-300"
        >
          Add Subject
        </motion.button>
      </div>
    </motion.form>

    {subjectArr.length === 0 && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-slate-400 text-lg"
      >
        Start by adding a study subject above!
      </motion.div>
    )}

    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {subjectArr.map((subject, index) => (
        <motion.div
          key={subject}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white border border-slate-100 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              {subject}
            </h2>
            <motion.button
              onClick={() => removeSubject(subject)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="text-red-500 hover:text-red-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>

          <form onSubmit={(e) => addResource(e, subject)} className="mb-6">
            <div className="flex space-x-2">
              <input
                type="text"
                value={resourceInputs[subject] || ''}
                onChange={(e) => setResourceInputs({
                  ...resourceInputs,
                  [subject]: e.target.value
                })}
                placeholder="Enter a resource"
                className="flex-grow px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md hover:bg-indigo-600"
              >
                Add
              </motion.button>
            </div>
          </form>
          <ul className="space-y-3">
            {resourcesBySubject[subject]?.map((r, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-lg"
              >
                <span className="text-slate-700 truncate">{r}</span>
                <motion.button
                  onClick={() => removeResource(subject, r)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="ml-2 bg-red-500 text-white px-3 py-2 rounded-md text-sm hover:bg-red-600"
                >
                  Remove
                </motion.button>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      ))}
    </motion.div>
  </div>
</div>

  </div>
  );
}
