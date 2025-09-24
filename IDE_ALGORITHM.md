# JavaRanker IDE Algorithm Documentation

## 🏗️ **IDE Architecture Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                    JavaRanker IDE                           │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React)          │  Backend (Node.js/Express)    │
│  ├─ Project Management     │  ├─ Code Execution (Judge0)   │
│  ├─ File System           │  ├─ Analytics Tracking        │
│  ├─ Monaco Editor         │  ├─ User Authentication       │
│  ├─ Version Control       │  └─ Database Operations       │
│  └─ UI Components         │                               │
└─────────────────────────────────────────────────────────────┘
```

## 📋 **Core Algorithm Flow**

### **1. IDE Initialization**
```
START IDE
├─ Check User Authentication
│  ├─ IF NOT LOGGED IN → Redirect to Login
│  └─ IF LOGGED IN → Continue
├─ Load User Projects from localStorage
│  ├─ Key: `ide_projects_${username}`
│  └─ Parse JSON project data
├─ Initialize UI State
│  ├─ Set default sidebar width (256px)
│  ├─ Set default output height (192px)
│  └─ Initialize empty arrays for tabs, git history
└─ Auto-open first project (if exists)
```

### **2. Project Management Algorithm**

#### **Create Project:**
```
CREATE_PROJECT(projectName)
├─ Validate projectName (non-empty, trimmed)
├─ Generate unique ID (timestamp)
├─ Create project structure:
│  ├─ files: {
│  │    "src/Main.java": DEFAULT_JAVA_TEMPLATE,
│  │    "README.md": PROJECT_README_TEMPLATE
│  │  }
│  ├─ settings: {
│  │    mainClass: "Main",
│  │    javaVersion: "17",
│  │    theme: "vs-dark"
│  │  }
│  └─ metadata: { id, name, createdAt }
├─ Add to projects array
├─ Save to localStorage
└─ Auto-open new project
```

#### **Open Project:**
```
OPEN_PROJECT(project)
├─ Ensure project has settings (backward compatibility)
├─ Set as currentProject
├─ Find first Java file OR first file
├─ Open file in editor
└─ Update UI state
```

### **3. File Management Algorithm**

#### **Create File:**
```
CREATE_FILE(fileName)
├─ Validate fileName and currentProject
├─ Add .java extension if missing
├─ Extract className from fileName
├─ Generate template based on file type:
│  ├─ IF .java → `public class ${className} { ... }`
│  └─ ELSE → empty content
├─ Add to project.files
├─ Save project
├─ Open file in editor
└─ Add to open tabs
```

#### **Open File:**
```
OPEN_FILE(fileName)
├─ Validate currentProject exists
├─ Set as currentFile
├─ Load content into editor
├─ Add to openTabs (if not already open)
└─ Update breadcrumbs
```

#### **Save File:**
```
SAVE_FILE()
├─ Validate currentProject and currentFile
├─ Update project.files[currentFile] = editorContent
├─ Save project to localStorage
├─ IF autoSave enabled → Create git snapshot
└─ Update UI indicators
```

### **4. Code Execution Algorithm**

#### **Run Code Flow:**
```
RUN_CODE()
├─ Set running state = true
├─ Clear previous output
├─ Show timestamp and "Compiling..." message
├─ Prepare execution payload:
│  ├─ language: "java"
│  ├─ code: current editor content
│  ├─ filename: currentFile name
│  └─ analytics data (username, challengeId)
├─ Send to /api/execute endpoint
├─ Process Judge0 response:
│  ├─ Decode base64 output
│  ├─ Format compilation errors
│  ├─ Format runtime output
│  └─ Format error messages
├─ Display formatted results
├─ Track analytics (if user logged in)
└─ Set running state = false
```

#### **Judge0 Integration:**
```
EXECUTE_ON_JUDGE0(code, filename)
├─ Validate Judge0 URL (SSRF protection)
├─ Encode code to base64
├─ Send POST request:
│  ├─ source_code: base64(code)
│  ├─ language_id: 62 (Java 17)
│  ├─ stdin: base64(input)
│  └─ wait: true (synchronous)
├─ Decode response:
│  ├─ stdout → Program output
│  ├─ stderr → Runtime errors  
│  ├─ compile_output → Compilation errors
│  └─ status → Execution status
└─ Return formatted result
```

### **5. Version Control Algorithm**

#### **Git Snapshot:**
```
SAVE_TO_GIT()
├─ Validate currentProject exists
├─ Create commit object:
│  ├─ id: timestamp
│  ├─ message: "Auto-save HH:MM:SS"
│  ├─ timestamp: ISO string
│  └─ files: deep copy of project.files
├─ Add to gitHistory (max 10 commits)
├─ Save to localStorage: `git_${projectId}`
└─ Update UI
```

#### **Restore from Git:**
```
RESTORE_FROM_GIT(commitId)
├─ Find commit in gitHistory
├─ Validate commit exists
├─ Restore project.files from commit.files
├─ Update currentProject
├─ Save updated project
├─ Refresh editor content
└─ Update UI
```

### **6. Auto-Save Algorithm**

```
AUTO_SAVE_EFFECT()
├─ Listen to code changes
├─ IF autoSave enabled AND code changed:
│  ├─ Set 2-second timer
│  ├─ Clear previous timer
│  └─ ON TIMER EXPIRE:
│     ├─ Save current file
│     └─ Create git snapshot
└─ Cleanup timer on unmount
```

### **7. Tab Management Algorithm**

#### **Tab Operations:**
```
OPEN_TAB(fileName)
├─ IF not in openTabs → Add to array
├─ Set as currentFile
└─ Update UI

CLOSE_TAB(fileName)
├─ Remove from openTabs array
├─ IF was currentFile:
│  ├─ IF other tabs exist → Switch to last tab
│  └─ ELSE → Clear editor
└─ Update UI
```

### **8. Live Templates Algorithm**

```
INSERT_TEMPLATE(templateName)
├─ Get template from predefined map:
│  ├─ psvm → public static void main
│  ├─ sout → System.out.println
│  ├─ fori → for loop with index
│  └─ ... other templates
├─ Get current editor selection
├─ Execute editor edit:
│  ├─ range: current selection
│  └─ text: template code
└─ Update editor content
```

### **9. Terminal Simulation Algorithm**

```
RUN_TERMINAL_COMMAND(command)
├─ Add command to history: "$ {command}"
├─ Process command:
│  ├─ "clear" → Clear terminal history
│  ├─ "ls" → List project files
│  ├─ "cat {file}" → Show file content
│  ├─ "pwd" → Show workspace path
│  └─ DEFAULT → "Command not found"
├─ Add output to terminal history
├─ Clear input field
└─ Update terminal UI
```

### **10. Settings Management Algorithm**

```
UPDATE_SETTINGS(settingType, value)
├─ SWITCH settingType:
│  ├─ THEME → Update project.settings.theme
│  ├─ FONT_SIZE → Update fontSize state
│  ├─ TAB_SIZE → Update tabSize state
│  ├─ AUTO_SAVE → Update autoSave state
│  └─ ... other settings
├─ IF project setting → Save project
├─ Update editor options
└─ Refresh UI
```

## 🔄 **Data Flow Diagram**

```
User Action → State Update → UI Render → Side Effects
     ↓              ↓           ↓           ↓
   Click Run → setRunning(true) → Show spinner → Execute code
   Edit Code → setCode(value) → Update editor → Auto-save timer
   Save File → saveCurrentFile() → Update indicator → Git snapshot
   New File → createFile() → Add to tree → Open in editor
```

## 💾 **Data Storage Strategy**

### **LocalStorage Keys:**
- `ide_projects_${username}` → All user projects
- `git_${projectId}` → Git history per project
- User preferences (fontSize, theme, etc.) → Component state

### **Project Structure:**
```typescript
Project = {
  id: string,           // Unique identifier
  name: string,         // Display name
  files: {              // File system
    [path]: content
  },
  settings: {           // Project configuration
    mainClass: string,
    javaVersion: string,
    theme: string
  },
  createdAt: string     // ISO timestamp
}
```

## 🚨 **Error Handling Strategy**

### **Compilation Errors:**
```
IF Judge0 returns compile_output:
├─ Display in "Compilation Output" section
├─ Highlight error lines (future enhancement)
└─ Show error count in Problems panel
```

### **Runtime Errors:**
```
IF Judge0 returns stderr:
├─ Display in "Error Output" section
├─ Parse stack traces (future enhancement)
└─ Log to console for debugging
```

### **Network Errors:**
```
IF fetch() fails:
├─ Display user-friendly error message
├─ Suggest checking internet connection
└─ Log technical details to console
```

## 🎯 **Key Design Decisions**

1. **Judge0 Limitation**: Public class must be named "Main" for execution
2. **LocalStorage**: Client-side persistence for offline capability
3. **Monaco Editor**: Professional code editing experience
4. **React State**: Centralized state management without external libraries
5. **IntelliJ UI**: Familiar interface for Java developers

## 🔧 **Performance Optimizations**

1. **Debounced Auto-save**: 2-second delay to prevent excessive saves
2. **Lazy Loading**: Components render only when needed
3. **Efficient Re-renders**: Proper React key usage and state structure
4. **Memory Management**: Cleanup timers and event listeners
5. **Optimized Storage**: JSON serialization with minimal data

This algorithm ensures a robust, user-friendly IDE experience with proper error handling, data persistence, and professional features comparable to desktop IDEs.