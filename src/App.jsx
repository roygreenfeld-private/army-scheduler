import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfWeek, addDays, parse, isAfter } from 'date-fns';
import { Eye, ShieldCheck, FileWarning, UserPlus, Home, CalendarDays, Menu, CheckCircle, Users, Settings, ChevronRight, ChevronLeft, Grid, ShieldAlert, AlertTriangle, CheckSquare, User, Plus } from 'lucide-react';
import WeeklyCalendar from './components/WeeklyCalendar';
import ConstraintPanel from './components/ConstraintPanel';
import RequestForm from './components/RequestForm';
import SoldierForm from './components/SoldierForm';
import TaskForm from './components/TaskForm';
import NotificationCenter from './components/NotificationCenter';
import Toast, { useToast } from './components/Toast';
import RoutineTasks from './components/RoutineTasks';
import RequestsAdmin from './components/RequestsAdmin';
import PersonalDashboard from './components/PersonalDashboard';
import ConstraintsManager from './components/ConstraintsManager';
import { globalConstraints, autoAssign, checkConstraints } from './utils/constraints';
import BattalionLogo from './components/BattalionLogo';
import IsraelFlag from './components/IsraelFlag';
import './types';
import './App.css';

// Updated Mock Data with realistic Soldiers from "מחלקה 1"
const INITIAL_SOLDIERS = [
  { id: 's1', name: 'שי אוקנין', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '1' },
  { id: 's2', name: 'דניאל אקסלרוד', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '1' },
  { id: 's3', name: 'איתי ארגס', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '1' },
  { id: 's4', name: 'עומר בוחבוט', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '1' },
  { id: 's5', name: 'דודו נעמן', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '1' },
  { id: 's6', name: 'דוד בול', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '1' },
  { id: 's7', name: 'סער הירשהורן', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '1' },
  { id: 's8', name: 'יונתן אלמלך', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '1' },
  { id: 's9', name: 'אביאל גרומבק', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '1' },
  { id: 's10', name: 'אופק גרוס', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '1' },
  { id: 's11', name: 'אור טושינסקי', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '1' },
  { id: 's12', name: 'טאגר ירבקטנוב', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '1' },
  { id: 's13', name: 'יניב ליבשין', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '1' },
  { id: 's14', name: 'דביר עזר', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '1' },
  { id: 's15', name: 'אליאור מרום', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '1' },
  { id: 's16', name: 'ליאור קוגן', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '1' },
  { id: 's17', name: 'ראובן בוהנה', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '1' },
  { id: 's18', name: 'לב לייפר', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '1' },
  { id: 's19', name: 'אלכסיי מורנוב', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '1' },
  { id: 's20', name: 'יובל מימון', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '1' },
  { id: 's21', name: 'דייב מנצ\'נקו', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '1' },
  { id: 's22', name: 'תום עמית', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '1' },
  { id: 's23', name: 'נדב גיא קרצמר', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '1' },
  { id: 's24', name: 'נדב יחי שר', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '1' },
  { id: 's25', name: 'דניאל הריס', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '1' },
  { id: 's26', name: 'חי עזרן', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '1' },
  { id: 's27', name: 'לוי יצחק שמח', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '1' },
  { id: 's28', name: 'רפאל בן ישי', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '2' },
  { id: 's29', name: 'רון אברהם', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '2' },
  { id: 's30', name: 'יהב אברמוביץ', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '2' },
  { id: 's31', name: 'דור אושר', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '2' },
  { id: 's32', name: 'אופק בוקי', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '2' },
  { id: 's33', name: 'יובל דגו', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '2' },
  { id: 's34', name: 'ארטור דוידוב', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '2' },
  { id: 's35', name: 'עומר דרור', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '2' },
  { id: 's36', name: 'יאסו אנטנוך', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '2' },
  { id: 's37', name: 'אברהם ר ועקנין', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '2' },
  { id: 's38', name: 'שנהב יעקב', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '2' },
  { id: 's39', name: 'יניב סבג', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '2' },
  { id: 's40', name: 'תדלה יתברך', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '2' },
  { id: 's41', name: 'טדי ברהן', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '2' },
  { id: 's42', name: 'שחף שלו', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '2' },
  { id: 's43', name: 'בן כהן', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '2' },
  { id: 's44', name: 'דוד לרנר', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '2' },
  { id: 's45', name: 'יובל יח מי-טל', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '2' },
  { id: 's46', name: 'עמנואל מרן', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '2' },
  { id: 's47', name: 'ינון נגאוקר', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '2' },
  { id: 's48', name: 'אליה מש נדם', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '2' },
  { id: 's49', name: 'ג\'רמי ר סבג', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '2' },
  { id: 's50', name: 'ציון ימנה', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '2' },
  { id: 's51', name: 'עלמו קומיה', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '2' },
  { id: 's52', name: 'אביתר קורצמן', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '2' },
  { id: 's53', name: 'נריה רם', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '2' },
  { id: 's54', name: 'עדי בן יהודה', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '2' },
  { id: 's55', name: 'רן ראוב כהן', roles: ['לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: '3' },
  { id: 's56', name: 'בראל חתוכה', roles: ['חפק', 'לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: 'חפק' },
  { id: 's57', name: 'יוני מרקס', roles: ['חפק', 'לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: 'חפק' },
  { id: 's58', name: 'מארק פולאק', roles: ['חפק', 'לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: 'חפק' },
  { id: 's59', name: 'אילן אוסקולסקי', roles: ['חפק', 'לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: 'חפק' },
  { id: 's60', name: 'איתי גרידיש', roles: ['חפק', 'לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: 'חפק' },
  { id: 's61', name: 'לביא צב דרורי', roles: ['חפק', 'לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: 'חפק' },
  { id: 's62', name: 'לב וסילצ\'נקו', roles: ['חפק', 'לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: 'חפק' },
  { id: 's63', name: 'רועי גרינפלד', roles: ['חפק', 'לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: 'חפק' },
  { id: 's64', name: 'יעקב רא סאטלר', roles: ['חפק', 'לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: 'חפק' },
  { id: 's65', name: 'כפיר שחר', roles: ['חפק', 'לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: 'חפק' },
  { id: 's66', name: 'ניב ברלין', roles: ['חפק', 'לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: 'חפק' },
  { id: 's67', name: 'תומר כזרי', roles: ['חפק', 'לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: 'חפק' },
  { id: 's68', name: 'סלבה קוביליאן', roles: ['מפלג', 'לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: 'מפלג' },
  { id: 's69', name: 'דניאל פרי', roles: ['מפלג', 'לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: 'מפלג' },
  { id: 's70', name: 'אריאל טרדלר', roles: ['מפלג', 'לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: 'מפלג' },
  { id: 's71', name: 'יבגני מורדוב', roles: ['מפלג', 'לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: 'מפלג' },
  { id: 's72', name: 'ניצן ברזילי', roles: ['מפלג', 'לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: 'מפלג' },
  { id: 's73', name: 'ניר ברק', roles: ['מפלג', 'לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: 'מפלג' },
  { id: 's74', name: 'שליו שרעבי', roles: ['מפלג', 'לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: 'מפלג' },
  { id: 's75', name: 'ניצן ענבר', roles: ['מפלג', 'לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: 'מפלג' },
  { id: 's76', name: 'אילן נאור', roles: ['מפלג', 'לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: 'מפלג' },
  { id: 's77', name: 'נתנאל סהלה', roles: ['מפלג', 'לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: 'מפלג' },
  { id: 's78', name: 'לאונל ד קושניר', roles: ['מפלג', 'לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: 'מפלג' },
  { id: 's79', name: 'נריה יוסף', roles: ['מפלג', 'לוחם'], isClosing: true, maxHoursPerShift: 24, isAtHome: false, personalRequests: [], platoon: 'מפלג' },
];

// Seed consecutive days: deterministic spread across 0-10 using soldier index
const DAYS_SEED = [3, 7, 1, 5, 10, 2, 0, 6, 0, 8, 4, 9, 3, 5, 0, 10, 2, 7, 1, 0, 6, 4, 8, 5, 0, 9, 3, 7, 2, 6, 4, 10, 1, 0, 5, 8, 3, 0, 7, 2, 6, 4, 9, 10, 0, 5, 3, 8, 0, 6, 4, 7, 2, 9];
const INITIAL_SOLDIERS_WITH_DAYS = INITIAL_SOLDIERS.map((s, i) => ({
  ...s,
  consecutiveDaysAtBase: DAYS_SEED[i] ?? 0
}));

// Helper: generate 24/7 shifts for a date
const make24x7Shifts = (dateStr, dayIdx) => [
  { id: `g_${dayIdx}_1`, name: 'ש"ג', requiredRoles: ['לוחם'], startTime: '00:00', endTime: '04:00', date: dateStr, requiresClosing: false },
  { id: `g_${dayIdx}_2`, name: 'ש"ג', requiredRoles: ['לוחם'], startTime: '04:00', endTime: '08:00', date: dateStr, requiresClosing: false },
  { id: `g_${dayIdx}_3`, name: 'ש"ג', requiredRoles: ['לוחם'], startTime: '08:00', endTime: '12:00', date: dateStr, requiresClosing: false },
  { id: `g_${dayIdx}_4`, name: 'ש"ג', requiredRoles: ['לוחם'], startTime: '12:00', endTime: '16:00', date: dateStr, requiresClosing: false },
  { id: `g_${dayIdx}_5`, name: 'ש"ג', requiredRoles: ['לוחם'], startTime: '16:00', endTime: '20:00', date: dateStr, requiresClosing: false },
  { id: `g_${dayIdx}_6`, name: 'ש"ג', requiredRoles: ['לוחם'], startTime: '20:00', endTime: '24:00', date: dateStr, requiresClosing: false },
];

const addDaysToDate = (startDateStr, offset) => {
  const d = new Date(startDateStr);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

const START_DATE = format(startOfWeek(new Date(), { weekStartsOn: 0 }), 'yyyy-MM-dd');
const END_DATE = format(addDays(new Date(START_DATE), 60), 'yyyy-MM-dd');
const totalDays = Math.round((new Date(END_DATE) - new Date(START_DATE)) / 86400000) + 1;

const guardShifts = [];
for (let i = 0; i < totalDays; i++) {
  const dateStr = addDaysToDate(START_DATE, i);
  make24x7Shifts(dateStr, i).forEach(s => guardShifts.push(s));
}

const namedTasks = [];
for (let i = 0; i < totalDays; i++) {
  const d = addDaysToDate(START_DATE, i);
  namedTasks.push(
    { id: `k_${i}`, name: 'תורנות מטבח', requiredRoles: [], startTime: '06:00', endTime: '18:00', date: d, requiresClosing: false },
    { id: `pt1_c_${i}`, name: 'סיור יום — צוות 1: מפקד', requiredRoles: ['מפקד'], startTime: '06:00', endTime: '18:00', date: d, requiresClosing: false },
    { id: `pt1_f1_${i}`, name: 'סיור יום — צוות 1: לוחם', requiredRoles: ['לוחם'], startTime: '06:00', endTime: '18:00', date: d, requiresClosing: false },
    { id: `pt1_f2_${i}`, name: 'סיור יום — צוות 1: לוחם', requiredRoles: ['לוחם'], startTime: '06:00', endTime: '18:00', date: d, requiresClosing: false },
    { id: `pt1_f3_${i}`, name: 'סיור יום — צוות 1: לוחם', requiredRoles: ['לוחם'], startTime: '06:00', endTime: '18:00', date: d, requiresClosing: false },
    { id: `pt2_c_${i}`, name: 'סיור יום — צוות 2: מפקד', requiredRoles: ['מפקד'], startTime: '06:00', endTime: '18:00', date: d, requiresClosing: false },
    { id: `pt2_f1_${i}`, name: 'סיור יום — צוות 2: לוחם', requiredRoles: ['לוחם'], startTime: '06:00', endTime: '18:00', date: d, requiresClosing: false },
    { id: `pt2_f2_${i}`, name: 'סיור יום — צוות 2: לוחם', requiredRoles: ['לוחם'], startTime: '06:00', endTime: '18:00', date: d, requiresClosing: false },
    { id: `pt2_f3_${i}`, name: 'סיור יום — צוות 2: לוחם', requiredRoles: ['לוחם'], startTime: '06:00', endTime: '18:00', date: d, requiresClosing: false },
    { id: `h_d1_${i}`, name: 'חמ"ל — יום', requiredRoles: ['לוחם'], startTime: '06:00', endTime: '18:00', date: d, requiresClosing: false },
    { id: `h_d2_${i}`, name: 'חמ"ל — יום', requiredRoles: ['לוחם'], startTime: '06:00', endTime: '18:00', date: d, requiresClosing: false },
    { id: `h_n1_${i}`, name: 'חמ"ל — לילה', requiredRoles: ['לוחם'], startTime: '18:00', endTime: '06:00', date: d, requiresClosing: false },
    { id: `h_n2_${i}`, name: 'חמ"ל — לילה', requiredRoles: ['לוחם'], startTime: '18:00', endTime: '06:00', date: d, requiresClosing: false },
    { id: `ka_${i}`, name: 'כיתת כוננות: מפקד', requiredRoles: ['מפקד'], startTime: '00:00', endTime: '24:00', date: d, requiresClosing: false },
    { id: `kb1_${i}`, name: 'כיתת כוננות: לוחם', requiredRoles: ['לוחם'], startTime: '00:00', endTime: '24:00', date: d, requiresClosing: false },
    { id: `kb2_${i}`, name: 'כיתת כוננות: לוחם', requiredRoles: ['לוחם'], startTime: '00:00', endTime: '24:00', date: d, requiresClosing: false },
    { id: `kb3_${i}`, name: 'כיתת כוננות: לוחם', requiredRoles: ['לוחם'], startTime: '00:00', endTime: '24:00', date: d, requiresClosing: false },
    { id: `kb4_${i}`, name: 'כיתת כוננות: לוחם', requiredRoles: ['לוחם'], startTime: '00:00', endTime: '24:00', date: d, requiresClosing: false },
    { id: `qm_${i}`, name: 'קצין מוצב', requiredRoles: ['מפקד', 'מ"מ'], startTime: '08:00', endTime: '20:00', date: d, requiresClosing: false },
    { id: `hq_cmd_${i}`, name: 'חפ"ק: מ"פ / סמ"פ', requiredRoles: ['מפקד'], startTime: '08:00', endTime: '20:00', date: d, requiresClosing: false },
    { id: `hq_sgt1_${i}`, name: 'חפ"ק: מפלג 1', requiredRoles: ['מפלג', 'לוחם'], startTime: '08:00', endTime: '20:00', date: d, requiresClosing: false },
    { id: `hq_sgt2_${i}`, name: 'חפ"ק: מפלג 2', requiredRoles: ['מפלג', 'לוחם'], startTime: '08:00', endTime: '20:00', date: d, requiresClosing: false },
  );
}

const INITIAL_TASKS = [...guardShifts, ...namedTasks];

const INITIAL_ROUTINE_TASKS = [
  { id: 'rt1', title: 'מסדר נשק מחלקתי', date: format(new Date(), 'yyyy-MM-dd'), time: '08:00', assignee: 'סמל רפאל בן ישי', isDone: false },
  { id: 'rt2', title: 'העברת תדריך בוקר', date: format(new Date(), 'yyyy-MM-dd'), time: '09:00', assignee: 'מ"מ נדב יחי שר', isDone: false },
  { id: 'rt3', title: 'בדיקת תקינות חמ"ל', date: format(new Date(), 'yyyy-MM-dd'), time: '10:00', assignee: 'תום עמית', isDone: false },
  { id: 'rt4', title: 'איסוף ציוד לסוף שבוע', date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), time: '12:00', assignee: '', isDone: false },
];

const GUARD_ROTATION = [
  's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12', 's13', 's14', 's15', 's16', 's17', 's18', 's19', 's20', 's21', 's22', 's23', 's24', 's25', 's26', 's27',
  's28', 's29', 's30', 's31', 's32', 's33', 's34', 's35', 's36', 's37', 's38', 's39', 's40', 's41', 's42', 's43', 's44', 's45', 's46', 's47', 's48', 's49', 's50', 's51', 's52', 's53', 's54', 's55',
];

const CMD = [
  's56', 's57', 's58', 's59', 's60', 's61', 's62', 's63', 's64', 's65', 's66', 's67', // חפק
  's68', 's69', 's70', 's71', 's72', 's73', 's74', 's75', 's76', 's77', 's78', 's79'  // מפלג
];

const LS_ASSIGNMENTS_KEY = 'shvatz_assignments_v3';
const LS_ROUTINE_KEY = 'shvatz_routine_done';

const loadSavedAssignments = () => {
  try {
    const saved = localStorage.getItem(LS_ASSIGNMENTS_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (_) { return null; }
};

const INITIAL_ASSIGNMENTS = (() => {
  const saved = loadSavedAssignments();
  if (saved) return saved;
  const a = {};
  for (let day = 0; day < totalDays; day++) {
    const base = day * 6;
    for (let slot = 0; slot < 6; slot++) {
      const guardId = `g_${day}_${slot + 1}`;
      const soldierId = GUARD_ROTATION[(base + slot) % GUARD_ROTATION.length];
      a[guardId] = soldierId;
    }
    a[`k_${day}`] = 's5';
    a[`pt1_c_${day}`] = CMD[day % CMD.length];
    a[`pt1_f1_${day}`] = GUARD_ROTATION[(day * 4) % GUARD_ROTATION.length];
    a[`pt1_f2_${day}`] = GUARD_ROTATION[(day * 4 + 1) % GUARD_ROTATION.length];
    a[`pt1_f3_${day}`] = GUARD_ROTATION[(day * 4 + 2) % GUARD_ROTATION.length];
    a[`pt2_c_${day}`] = CMD[(day + 1) % CMD.length];
    a[`pt2_f1_${day}`] = GUARD_ROTATION[(day * 4 + 3) % GUARD_ROTATION.length];
    a[`pt2_f2_${day}`] = GUARD_ROTATION[(day * 4 + 4) % GUARD_ROTATION.length];
    a[`pt2_f3_${day}`] = GUARD_ROTATION[(day * 4 + 5) % GUARD_ROTATION.length];
    a[`h_d1_${day}`] = 's53';
    a[`h_d2_${day}`] = 's40';
    a[`h_n1_${day}`] = 's50';
    a[`h_n2_${day}`] = 's51';
    a[`ka_${day}`] = CMD[(day + 3) % CMD.length];
    a[`kb1_${day}`] = 's34';
    a[`kb2_${day}`] = 's36';
    a[`kb3_${day}`] = 's41';
    a[`kb4_${day}`] = 's53';
    a[`qm_${day}`] = CMD[(day + 1) % CMD.length];
    a[`hq_cmd_${day}`] = CMD[(day + 2) % CMD.length];
    a[`hq_sgt1_${day}`] = 's47';
    a[`hq_sgt2_${day}`] = 's38';
  }
  return a;
})();

const hydrateTasksWithDates = (tasks) => tasks;

const isTaskOverdue = (taskTimeStr, taskDateStr) => {
  try {
    if (!taskTimeStr || !taskDateStr) return false;
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');
    if (taskDateStr !== todayStr) return false;

    // Normalize time to HH:mm just in case
    const cleanTime = taskTimeStr.substring(0, 5);
    const taskTime = parse(`${taskDateStr} ${cleanTime}`, 'yyyy-MM-dd HH:mm', new Date());

    return !isNaN(taskTime) && isAfter(now, taskTime);
  } catch (e) {
    return false;
  }
};

export default function App() {
  const [currentUserRole, setCurrentUserRole] = useState('commander');
  const [tasks] = useState(INITIAL_TASKS);
  const [soldiers, setSoldiers] = useState(INITIAL_SOLDIERS_WITH_DAYS);
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
  const [routineTasks, setRoutineTasks] = useState(() => {
    const doneMap = (() => {
      try { return JSON.parse(localStorage.getItem(LS_ROUTINE_KEY) || '{}'); } catch (_) { return {}; }
    })();
    return INITIAL_ROUTINE_TASKS.map(t => ({ ...t, isDone: doneMap[t.id] ?? t.isDone }));
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768); // default based on screen size
  const [activeTab, setActiveTab] = useState('calendar');
  const [calendarViewMode, setCalendarViewMode] = useState('day');
  const [calendarJumpDate, setCalendarJumpDate] = useState(null);
  const [logoGlow, setLogoGlow] = useState(false);

  // New State for dynamic general constraints
  const [dynamicConstraints, setDynamicConstraints] = useState({});

  // Routine task form state
  const [showRoutineTaskForm, setShowRoutineTaskForm] = useState(false);
  const [newTaskData, setNewTaskData] = useState({ title: '', time: '08:00', assignee: '' });

  // Persistence of routine tasks status
  useEffect(() => {
    const doneMap = {};
    routineTasks.forEach(t => { if (t.id) doneMap[t.id] = t.isDone; });
    try { localStorage.setItem(LS_ROUTINE_KEY, JSON.stringify(doneMap)); } catch (_) { }
  }, [routineTasks]);

  useEffect(() => {
    try { localStorage.setItem(LS_ASSIGNMENTS_KEY, JSON.stringify(assignments)); } catch (_) { }
  }, [assignments]);

  const handleNavigateToTask = useCallback((task) => {
    if (task?.date) setCalendarJumpDate(new Date(task.date));
    setActiveTab('calendar');
    setCalendarViewMode('day');
  }, []);

  const { toasts, showToast, dismissToast } = useToast();
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const [restViolationTaskIds, setRestViolationTaskIds] = useState(new Set());
  const [forcedTaskIds, setForcedTaskIds] = useState(new Set());

  const hydratedTasks = useMemo(() => hydrateTasksWithDates(tasks), [tasks]);

  const soldiersAtHome = useMemo(() => {
    return soldiers.filter(s => s.isAtHome);
  }, [soldiers]);

  const toggleRole = useCallback(() =>
    setCurrentUserRole(r => (r === 'commander' ? 'soldier' : 'commander')), []);

  const handleManualAssign = useCallback((taskId, soldierId) => {
    setAssignments(prev => {
      const updated = { ...prev, [taskId]: soldierId };
      return updated;
    });
  }, []);

  const handleAddRoutineTask = useCallback((task) => {
    const newTask = {
      ...task,
      id: `rt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      isDone: false,
      date: format(new Date(), 'yyyy-MM-dd')
    };
    setRoutineTasks(prev => [...prev, newTask]);
    showToast({ type: 'success', title: 'משימה נוספה', message: `משימת "${task.title}" נוספה בהצלחה.` });
  }, [showToast]);

  const handleAddSoldier = useCallback((newSoldier) => {
    setSoldiers(prev => [...prev, newSoldier]);
    showToast({ type: 'success', title: 'חייל נוסף', message: `${newSoldier.name} הוזן בהצלחה למערכת!` });
    setActiveTab('calendar');
  }, [showToast]);

  const handleRemoveSoldier = useCallback((soldierId) => {
    setSoldiers(prev => prev.filter(s => s.id !== soldierId));
    setAssignments(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(taskId => {
        if (updated[taskId] === soldierId) delete updated[taskId];
      });
      return updated;
    });
  }, []);

  const handleUpdateSoldier = useCallback((updatedSoldier) => {
    setSoldiers(prev => prev.map(s => s.id === updatedSoldier.id ? updatedSoldier : s));
  }, []);

  const handleToggleAtHome = useCallback((soldierId) => {
    setSoldiers(prev => prev.map(s =>
      s.id === soldierId ? { ...s, isAtHome: !s.isAtHome } : s
    ));
  }, []);

  const handleAddConstraint = useCallback((constraint) => {
    setDynamicConstraints(prev => ({ ...prev, [constraint.id]: constraint }));
    showToast({ type: 'success', title: 'אילוץ נשמר', message: 'האילוץ נוסף בהצלחה למערכת.' });
  }, [showToast]);

  const handleRemoveConstraint = useCallback((constraintId) => {
    setDynamicConstraints(prev => {
      const updated = { ...prev };
      delete updated[constraintId];
      return updated;
    });
    showToast({ type: 'info', title: 'אילוץ נמחק', message: 'האילוץ הוסר בהצלחה.' });
  }, [showToast]);

  const handleToggleRoutineTask = useCallback((taskId) => {
    setRoutineTasks(prev => prev.map(t => t.id === taskId ? { ...t, isDone: !t.isDone } : t));
  }, []);

  // Check for missed routine tasks today
  const overdueTasks = useMemo(() => {
    return routineTasks.filter(t => isTaskOverdue(t.time, t.date) && !t.isDone);
  }, [routineTasks]);

  const todayTasks = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return routineTasks.filter(t => t.date === todayStr);
  }, [routineTasks]);

  const handleAutoAssign = useCallback(async () => {
    if (isAutoAssigning) return;
    setIsAutoAssigning(true);
    setLogoGlow(false);
    showToast({ type: 'info', title: 'שיבוץ אוטומטי רץ...', message: 'מחשב מסלולים מחדש...', duration: 30000 });

    await new Promise(r => setTimeout(r, 50));

    // Restore to normal autoAssign without the blocker logic
    const { newAssignmentsMap, conflicts, restViolationSet, forcedSet } =
      autoAssign(hydratedTasks, soldiers, assignments);

    setAssignments(newAssignmentsMap);
    setRestViolationTaskIds(restViolationSet || new Set());
    setForcedTaskIds(forcedSet || new Set());

    try { localStorage.setItem(LS_ASSIGNMENTS_KEY, JSON.stringify(newAssignmentsMap)); } catch (_) { }
    setIsAutoAssigning(false);

    if (conflicts && conflicts.length > 0) {
      showToast({ type: 'warning', title: 'שיבוץ חלקי', message: `${conflicts.length} משימות ללא פתרון אפשרי.`, duration: 6000 });
    } else {
      showToast({ type: 'success', title: 'שיבוץ אוטומטי הושלם', message: 'כל המשימות אוישו בהצלחה!', duration: 4000 });
      setLogoGlow(true);
      setTimeout(() => setLogoGlow(false), 3000);
    }
  }, [isAutoAssigning, hydratedTasks, soldiers, assignments, showToast]);

  const pendingTodayTasks = useMemo(() => todayTasks.filter(t => !t.isDone), [todayTasks]);

  return (
    <div className="app-layout" dir="rtl">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* ─── SIDEBAR ─── */}
      <aside className={`app-sidebar ${isSidebarOpen ? 'open' : 'sidebar-closed'}`}>
        {/* Branding */}
        <div className="sidebar-brand">
          <span className="sidebar-title-text">שבץ-קרב</span>
          <span className="sidebar-subtitle">גדוד 749</span>
        </div>

        <nav className="sidebar-nav">
          {/* שיבוץ */}
          <div className="sidebar-section-label">שיבוץ</div>
          <button
            className={activeTab === 'calendar' && calendarViewMode === 'day' ? 'active' : ''}
            onClick={() => { setActiveTab('calendar'); setCalendarViewMode('day'); setIsSidebarOpen(false); }}
          >
            <ShieldCheck size={20} />
            שיבוץ יומי
          </button>
          <button
            className={activeTab === 'calendar' && calendarViewMode === 'week' ? 'active' : ''}
            onClick={() => { setActiveTab('calendar'); setCalendarViewMode('week'); setIsSidebarOpen(false); }}
          >
            <CalendarDays size={20} />
            תצוגה שבועית
          </button>
          <button
            className={activeTab === 'calendar' && calendarViewMode === 'month' ? 'active' : ''}
            onClick={() => { setActiveTab('calendar'); setCalendarViewMode('month'); setIsSidebarOpen(false); }}
          >
            <Grid size={20} />
            תצוגה חודשית
          </button>

          {/* סגל */}
          {currentUserRole === 'commander' && (
            <>
              <div className="sidebar-section-label">סגל</div>
              <button
                className={activeTab === 'database' ? 'active' : ''}
                onClick={() => { setActiveTab('database'); setIsSidebarOpen(false); }}
              >
                <Users size={20} />
                ניהול סגל
              </button>
              <button
                className={activeTab === 'at-home' ? 'active' : ''}
                onClick={() => { setActiveTab('at-home'); setIsSidebarOpen(false); }}
              >
                <Home size={20} />
                בבית / חסרים
                {soldiersAtHome.length > 0 && <span className="sidebar-badge">{soldiersAtHome.length}</span>}
              </button>

              {/* משימות */}
              <div className="sidebar-section-label">משימות</div>
              <button
                className={activeTab === 'routine-tasks' ? 'active' : ''}
                onClick={() => { setActiveTab('routine-tasks'); setIsSidebarOpen(false); }}
              >
                <CheckSquare size={20} />
                משימות שגרה
              </button>
              <button
                className={activeTab === 'tasks' ? 'active' : ''}
                onClick={() => { setActiveTab('tasks'); setIsSidebarOpen(false); }}
              >
                <FileWarning size={20} />
                הגדרת משימות
              </button>

              {/* הגדרות */}
              <div className="sidebar-section-label">הגדרות</div>
              <button
                className={activeTab === 'constraints' ? 'active' : ''}
                onClick={() => { setActiveTab('constraints'); setIsSidebarOpen(false); }}
              >
                <ShieldAlert size={20} />
                חוקי שיבוץ ואילוצים
              </button>
            </>
          )}

          <button
            className={activeTab === 'requests' ? 'active' : ''}
            onClick={() => { setActiveTab('requests'); setIsSidebarOpen(false); }}
          >
            <CalendarDays size={20} />
            {currentUserRole === 'soldier' ? 'לוח שיבוצים (אישי)' : 'בקשות חיילים'}
          </button>
        </nav>


      </aside>

      {/* ─── MAIN AREA ─── */}
      <div className="app-main-area">
        {/* Header Alert Banner */}
        {overdueTasks.length > 0 && (
          <div style={{ background: 'var(--error-color)', color: 'white', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 'bold', boxShadow: '0 44px 12px rgba(239, 68, 68, 0.4)', zIndex: 10, animation: 'slideDown 0.3s ease-out' }}>
            <AlertTriangle size={24} className="animate-pulse" />
            <div style={{ flex: 1 }}>
              שים לב! {overdueTasks.length} משימות שגרה עברו את זמן היעד ולא סומנו כבוצעו:
              <span style={{ fontWeight: 'normal', opacity: 0.9, marginRight: '8px' }}>
                {overdueTasks.map(t => t.title).join(', ')}
              </span>
            </div>
          </div>
        )}
        {/* TOPBAR */}
        <header className="app-topbar">
          <div className="topbar-right">
            <button className="menu-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)} title="פתח/סגור תפריט צד">
              <Menu size={24} />
            </button>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>מחובר כעת כ:</span>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                {currentUserRole === 'commander' ? 'מפקד/קצין (גורם מאשר)' : 'חייל סדיר'}
              </strong>
            </div>
            <button
              onClick={toggleRole}
              className="btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', marginRight: '1rem', backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <Eye size={14} style={{ marginLeft: '4px' }} />
              {currentUserRole === 'commander' ? 'עבור לתצוגת חייל' : 'עבור לתצוגת מפקד'}
            </button>
          </div>

          <div className="topbar-left">
            {currentUserRole === 'commander' && (
              <>
                <NotificationCenter
                  tasks={hydratedTasks}
                  soldiers={soldiers}
                  assignments={assignments}
                  onNavigateToTask={handleNavigateToTask}
                />
                <button
                  className="btn-primary"
                  onClick={handleAutoAssign}
                  disabled={isAutoAssigning}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <ShieldCheck size={16} />
                  {isAutoAssigning ? 'מחשב...' : 'שיבוץ אוטומטי'}
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setActiveTab('add-soldier')}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <UserPlus size={16} />
                  הוסף חייל
                </button>
              </>
            )}
          </div>
        </header>

        {/* CONTENT */}
        <main className="app-content">
          {activeTab === 'calendar' && (
            <>
              <WeeklyCalendar
                tasks={hydratedTasks}
                soldiers={soldiers}
                assignments={assignments}
                onAssign={handleManualAssign}
                onAutoAssign={handleAutoAssign}
                currentUserRole={currentUserRole}
                jumpDate={calendarJumpDate}
                viewModeOverride={calendarViewMode}
                onViewModeChange={setCalendarViewMode}
                restViolationTaskIds={restViolationTaskIds}
                forcedTaskIds={forcedTaskIds}
              />
            </>
          )}

          {activeTab === 'database' && currentUserRole === 'commander' && (
            <SoldierForm
              soldiers={soldiers}
              onAdd={handleAddSoldier}
              onRemove={handleRemoveSoldier}
              onUpdate={handleUpdateSoldier}
              onToggleAtHome={handleToggleAtHome}
            />
          )}
          {activeTab === 'constraints' && currentUserRole === 'commander' && (
            <ConstraintsManager
              dynamicConstraints={dynamicConstraints}
              onAddConstraint={handleAddConstraint}
              onRemoveConstraint={handleRemoveConstraint}
            />
          )}
          {activeTab === 'tasks' && currentUserRole === 'commander' && (
            <TaskForm tasks={hydratedTasks} />
          )}
          {activeTab === 'requests' && (
            currentUserRole === 'commander'
              ? <RequestsAdmin soldiers={soldiers} tasks={hydratedTasks} assignments={assignments} />
              : <PersonalDashboard soldiers={soldiers} hydratedTasks={hydratedTasks} assignments={assignments} />
          )}
          {activeTab === 'at-home' && (
            <div className="view-container">
              <div className="view-header">
                <h2>חיילים בבית / חסרים</h2>
                <p>רשימת החיילים שאינם זמינים כרגע לשיבוץ במערכת.</p>
              </div>

              <div className="premium-card">
                <div className="card-header">
                  <Home size={20} />
                  <span>סטטוס נוכחות סגל ({soldiersAtHome.length})</span>
                </div>
                <div className="card-body">
                  {soldiersAtHome.length > 0 ? (
                    <div className="at-home-list">
                      {soldiersAtHome.map(s => (
                        <div key={s.id} className="at-home-item">
                          <div className="soldier-info">
                            <span className="soldier-name">{s.name}</span>
                            <span className="soldier-meta">מחלקה: {s.platoon}</span>
                          </div>
                          <button
                            className="btn-secondary"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                            onClick={() => handleToggleAtHome(s.id)}
                          >
                            החזר ליחידה
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="all-present-msg">
                      <div className="status-dot green"></div>
                      <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)' }}>כל החיילים נמצאים ביחידה</span>
                      <p>נכון לעכשיו, הסגל מלא וזמין לשיבוץ משימות.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'routine-tasks' && (
            <div className="view-container">
              <div className="view-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div>
                    <h2>משימות שגרה</h2>
                    <p>מעקב וביצוע משימות תפעוליות יומיות.</p>
                  </div>
                  {currentUserRole === 'commander' && (
                    <button
                      className={`btn-${showRoutineTaskForm ? 'secondary' : 'primary'}`}
                      onClick={() => setShowRoutineTaskForm(!showRoutineTaskForm)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      {showRoutineTaskForm ? 'ביטול' : <><Plus size={18} /> הוסף משימה</>}
                    </button>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {showRoutineTaskForm && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="premium-card routine-form-card"
                    style={{ marginBottom: '2rem' }}
                  >
                    <div className="card-header">הוספת משימה חדשה</div>
                    <div className="card-body routine-form-body">
                      <div className="form-group">
                        <label>שם המשימה</label>
                        <input
                          type="text"
                          placeholder="לדוגמה: מסדר בוקר"
                          value={newTaskData.title}
                          onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>שעה</label>
                          <input
                            type="time"
                            value={newTaskData.time}
                            onChange={(e) => setNewTaskData({ ...newTaskData, time: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>אחראי (אופציונלי)</label>
                          <input
                            type="text"
                            placeholder="שם האחראי"
                            value={newTaskData.assignee}
                            onChange={(e) => setNewTaskData({ ...newTaskData, assignee: e.target.value })}
                          />
                        </div>
                      </div>
                      <button
                        className="btn-primary"
                        style={{ width: '100%', marginTop: '1rem' }}
                        onClick={() => {
                          if (newTaskData.title && newTaskData.time) {
                            handleAddRoutineTask(newTaskData);
                            setNewTaskData({ title: '', time: '08:00', assignee: '' });
                            setShowRoutineTaskForm(false);
                          }
                        }}
                      >
                        שמור משימה
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="premium-card">
                <div className="card-header">
                  <CheckSquare size={20} />
                  <span>צ'ק-ליסט יומי: {format(new Date(), 'dd/MM/yyyy')}</span>
                </div>
                <div className="card-body">
                  <div className="routine-tasks-big-list">
                    <AnimatePresence>
                      {pendingTodayTasks.map(t => {
                        const overdue = isTaskOverdue(t.time, t.date);
                        return (
                          <motion.div
                            key={t.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            className={`routine-task-big-item ${overdue ? 'overdue' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={t.isDone}
                              onChange={() => handleToggleRoutineTask(t.id)}
                              className="big-checkbox"
                            />
                            <div className="task-content">
                              <span className="task-time">{t.time}{overdue && ' (באיחור)'}</span>
                              <span className="task-title">{t.title}</span>
                              <span className="task-assignee">
                                <User size={12} style={{ marginLeft: '4px' }} />
                                {t.assignee || 'טרם נקבע אחראי'}
                              </span>
                            </div>
                            {overdue && <AlertTriangle size={24} style={{ color: 'var(--error-color)' }} className="animate-pulse" />}
                            {t.isDone && <CheckCircle size={24} style={{ color: 'var(--success-color)' }} />}
                          </motion.div>
                        );
                      })}
                      {pendingTodayTasks.length === 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="all-present-msg"
                        >
                          <CheckCircle size={48} style={{ color: 'var(--success-color)', opacity: 0.5 }} />
                          <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>כל המשימות להיום הושלמו!</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'add-soldier' && currentUserRole === 'commander' && (
            <RequestForm onSubmit={(req) => {
              showToast({ type: 'success', title: 'בקשה התקבלה', message: `הבקשה מ - ${req.soldierName} נרשמה.` });
              setActiveTab('requests');
            }} />
          )}
        </main>
      </div>

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}