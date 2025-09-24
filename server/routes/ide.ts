import type { RequestHandler } from "express";
import { pool } from "../db";
import { sanitizeInput, sanitizeHtml, checkRateLimit, validateCsrfToken } from "../utils/security.js";
import { z } from "zod";

const ideSettingsSchema = z.object({
  username: z.string().min(1).max(64),
  settings: z.object({
    fontFamily: z.string().max(50),
    fontSize: z.number().min(8).max(32),
    fontWeight: z.string().max(10),
    lineHeight: z.number().min(0.5).max(3),
    letterSpacing: z.number().min(-5).max(5),
    editorTheme: z.string().max(50),
    uiTheme: z.string().max(20),
    showToolbar: z.boolean(),
    showBreadcrumbs: z.boolean(),
    showMinimap: z.boolean(),
    wordWrap: z.boolean(),
    showLineNumbers: z.boolean(),
    tabSize: z.number().min(1).max(8),
    autoSave: z.boolean(),
    sidebarWidth: z.number().min(100).max(800),
    outputHeight: z.number().min(100).max(600),
    terminalFontSize: z.number().min(8).max(24)
  })
});

// Save IDE Settings
export const saveIDESettings: RequestHandler = async (req, res) => {
  try {
    if (!checkRateLimit(`ide_settings_${req.ip}`, 20, 60000)) {
      return res.status(429).json({ error: "Too many requests" });
    }

    const parsed = ideSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const { username, settings } = parsed.data;
    const sanitizedUsername = sanitizeInput(username);

    const query = `
      INSERT INTO user_ide_settings (
        username, font_family, font_size, font_weight, line_height, letter_spacing,
        editor_theme, ui_theme, show_toolbar, show_breadcrumbs, show_minimap,
        word_wrap, show_line_numbers, tab_size, auto_save, sidebar_width,
        output_height, terminal_font_size
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        font_family = VALUES(font_family),
        font_size = VALUES(font_size),
        font_weight = VALUES(font_weight),
        line_height = VALUES(line_height),
        letter_spacing = VALUES(letter_spacing),
        editor_theme = VALUES(editor_theme),
        ui_theme = VALUES(ui_theme),
        show_toolbar = VALUES(show_toolbar),
        show_breadcrumbs = VALUES(show_breadcrumbs),
        show_minimap = VALUES(show_minimap),
        word_wrap = VALUES(word_wrap),
        show_line_numbers = VALUES(show_line_numbers),
        tab_size = VALUES(tab_size),
        auto_save = VALUES(auto_save),
        sidebar_width = VALUES(sidebar_width),
        output_height = VALUES(output_height),
        terminal_font_size = VALUES(terminal_font_size),
        updated_at = CURRENT_TIMESTAMP
    `;

    await pool.execute(query, [
      sanitizedUsername, sanitizeInput(settings.fontFamily), settings.fontSize, sanitizeInput(settings.fontWeight),
      settings.lineHeight, settings.letterSpacing, sanitizeInput(settings.editorTheme),
      sanitizeInput(settings.uiTheme), settings.showToolbar, settings.showBreadcrumbs,
      settings.showMinimap, settings.wordWrap, settings.showLineNumbers,
      settings.tabSize, settings.autoSave, settings.sidebarWidth,
      settings.outputHeight, settings.terminalFontSize
    ]);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to save settings" });
  }
};

// Load IDE Settings
export const loadIDESettings: RequestHandler = async (req, res) => {
  try {
    const username = sanitizeInput(req.params.username);
    if (!username) {
      return res.status(400).json({ error: "Invalid username" });
    }
    
    const [rows] = await pool.execute(
      "SELECT * FROM user_ide_settings WHERE username = ?",
      [username]
    );

    if ((rows as any[]).length === 0) {
      // Return default settings
      return res.json({
        fontFamily: 'JetBrains Mono',
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 1.5,
        letterSpacing: 0,
        editorTheme: 'vs-dark',
        uiTheme: 'dark',
        showToolbar: true,
        showBreadcrumbs: true,
        showMinimap: true,
        wordWrap: true,
        showLineNumbers: true,
        tabSize: 4,
        autoSave: true,
        sidebarWidth: 256,
        outputHeight: 192,
        terminalFontSize: 14
      });
    }

    const settings = (rows as any[])[0];
    res.json({
      fontFamily: settings.font_family,
      fontSize: settings.font_size,
      fontWeight: settings.font_weight,
      lineHeight: settings.line_height,
      letterSpacing: settings.letter_spacing,
      editorTheme: settings.editor_theme,
      uiTheme: settings.ui_theme,
      showToolbar: settings.show_toolbar,
      showBreadcrumbs: settings.show_breadcrumbs,
      showMinimap: settings.show_minimap,
      wordWrap: settings.word_wrap,
      showLineNumbers: settings.show_line_numbers,
      tabSize: settings.tab_size,
      autoSave: settings.auto_save,
      sidebarWidth: settings.sidebar_width,
      outputHeight: settings.output_height,
      terminalFontSize: settings.terminal_font_size
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to load settings" });
  }
};

const projectsSchema = z.object({
  username: z.string().min(1).max(64),
  projects: z.array(z.object({
    id: z.string().max(100),
    name: z.string().max(100),
    files: z.record(z.string()),
    settings: z.record(z.any())
  }))
});

// Save Projects
export const saveProjects: RequestHandler = async (req, res) => {
  try {
    if (!checkRateLimit(`save_projects_${req.ip}`, 10, 60000)) {
      return res.status(429).json({ error: "Too many requests" });
    }

    const parsed = projectsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const { username, projects } = parsed.data;
    const sanitizedUsername = sanitizeInput(username);

    // Delete existing projects for user
    await pool.execute("DELETE FROM user_projects WHERE username = ?", [sanitizedUsername]);

    // Insert new projects with sanitized data
    for (const project of projects) {
      const sanitizedProject = {
        id: sanitizeInput(project.id),
        name: sanitizeHtml(project.name),
        files: Object.fromEntries(
          Object.entries(project.files).map(([key, value]) => [
            sanitizeInput(key),
            typeof value === 'string' ? value.slice(0, 50000) : String(value).slice(0, 50000)
          ])
        ),
        settings: project.settings
      };
      
      await pool.execute(
        `INSERT INTO user_projects (project_id, username, name, files, settings) 
         VALUES (?, ?, ?, ?, ?)`,
        [sanitizedProject.id, sanitizedUsername, sanitizedProject.name, 
         JSON.stringify(sanitizedProject.files), JSON.stringify(sanitizedProject.settings)]
      );
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to save projects" });
  }
};

// Load Projects
export const loadProjects: RequestHandler = async (req, res) => {
  try {
    const username = sanitizeInput(req.params.username);
    if (!username) {
      return res.status(400).json({ error: "Invalid username" });
    }
    
    const [rows] = await pool.execute(
      "SELECT * FROM user_projects WHERE username = ? ORDER BY updated_at DESC",
      [username]
    );

    const projects = (rows as any[]).map(row => ({
      id: row.project_id,
      name: row.name,
      files: JSON.parse(row.files),
      settings: JSON.parse(row.settings),
      createdAt: row.created_at
    }));

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Failed to load projects" });
  }
};

const sessionSchema = z.object({
  username: z.string().min(1).max(64),
  session: z.object({
    currentProjectId: z.string().max(100).nullable(),
    currentFile: z.string().max(200),
    openTabs: z.array(z.string().max(200)),
    terminalHistory: z.array(z.string().max(1000)),
    commandHistory: z.array(z.string().max(500)),
    currentDirectory: z.string().max(500),
    gitHistory: z.array(z.any())
  })
});

// Save IDE Session State
export const saveIDESession: RequestHandler = async (req, res) => {
  try {
    if (!checkRateLimit(`save_session_${req.ip}`, 30, 60000)) {
      return res.status(429).json({ error: "Too many requests" });
    }

    const parsed = sessionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const { username, session } = parsed.data;
    const sanitizedUsername = sanitizeInput(username);
    
    const query = `
      INSERT INTO user_ide_sessions (
        username, current_project_id, current_file, open_tabs, 
        terminal_history, command_history, current_directory, git_history
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        current_project_id = VALUES(current_project_id),
        current_file = VALUES(current_file),
        open_tabs = VALUES(open_tabs),
        terminal_history = VALUES(terminal_history),
        command_history = VALUES(command_history),
        current_directory = VALUES(current_directory),
        git_history = VALUES(git_history),
        last_activity = CURRENT_TIMESTAMP
    `;

    const sanitizedSession = {
      currentProjectId: session.currentProjectId ? sanitizeInput(session.currentProjectId) : null,
      currentFile: sanitizeInput(session.currentFile),
      openTabs: session.openTabs.map(tab => sanitizeInput(tab)),
      terminalHistory: session.terminalHistory.map(cmd => sanitizeInput(cmd)),
      commandHistory: session.commandHistory.map(cmd => sanitizeInput(cmd)),
      currentDirectory: sanitizeInput(session.currentDirectory),
      gitHistory: session.gitHistory
    };

    await pool.execute(query, [
      sanitizedUsername, sanitizedSession.currentProjectId, sanitizedSession.currentFile,
      JSON.stringify(sanitizedSession.openTabs), JSON.stringify(sanitizedSession.terminalHistory),
      JSON.stringify(sanitizedSession.commandHistory), sanitizedSession.currentDirectory,
      JSON.stringify(sanitizedSession.gitHistory)
    ]);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to save session" });
  }
};

// Load IDE Session State
export const loadIDESession: RequestHandler = async (req, res) => {
  try {
    const username = sanitizeInput(req.params.username);
    if (!username) {
      return res.status(400).json({ error: "Invalid username" });
    }
    
    const [rows] = await pool.execute(
      "SELECT * FROM user_ide_sessions WHERE username = ?",
      [username]
    );

    if ((rows as any[]).length === 0) {
      return res.json({
        currentProjectId: null,
        currentFile: "",
        openTabs: [],
        terminalHistory: [],
        commandHistory: [],
        currentDirectory: "/",
        gitHistory: []
      });
    }

    const session = (rows as any[])[0];
    res.json({
      currentProjectId: session.current_project_id,
      currentFile: session.current_file,
      openTabs: JSON.parse(session.open_tabs || '[]'),
      terminalHistory: JSON.parse(session.terminal_history || '[]'),
      commandHistory: JSON.parse(session.command_history || '[]'),
      currentDirectory: session.current_directory,
      gitHistory: JSON.parse(session.git_history || '[]')
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to load session" });
  }
};