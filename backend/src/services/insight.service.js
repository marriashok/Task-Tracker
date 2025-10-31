// backend/src/services/insight.service.js
const { getDatabase } = require('../db/database');

function getInsights() {
  const db = getDatabase();

  // Get total open tasks
  const totalOpenStmt = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'Open'");
  const totalOpen = totalOpenStmt.get().count;

  // Get priority distribution for open tasks
  const priorityStmt = db.prepare(`
    SELECT priority, COUNT(*) as count 
    FROM tasks 
    WHERE status != 'Done'
    GROUP BY priority
  `);
  const priorityDistribution = priorityStmt.all();

  // Get tasks due soon (within next 7 days)
  const today = new Date().toISOString().split('T')[0];
  const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const dueSoonStmt = db.prepare(`
    SELECT COUNT(*) as count 
    FROM tasks 
    WHERE status != 'Done' 
    AND due_date BETWEEN ? AND ?
  `);
  const dueSoonCount = dueSoonStmt.get(today, sevenDaysLater).count;

  // Get overdue tasks
  const overdueStmt = db.prepare(`
    SELECT COUNT(*) as count 
    FROM tasks 
    WHERE status != 'Done' 
    AND due_date < ?
  `);
  const overdueCount = overdueStmt.get(today).count;

  // Get total tasks by status
  const statusStmt = db.prepare(`
    SELECT status, COUNT(*) as count 
    FROM tasks 
    GROUP BY status
  `);
  const statusDistribution = statusStmt.all();

  // Generate AI-like summary
  const summary = generateInsightString({
    totalOpen,
    priorityDistribution,
    dueSoonCount,
    overdueCount,
    statusDistribution
  });

  return {
    summary,
    metrics: {
      totalOpen,
      priorityDistribution,
      dueSoonCount,
      overdueCount,
      statusDistribution
    }
  };
}

function generateInsightString(data) {
  const { totalOpen, priorityDistribution, dueSoonCount, overdueCount } = data;
  
  let insights = [];

  // Insight about open tasks
  if (totalOpen === 0) {
    insights.push("🎉 Great job! You have no open tasks.");
  } else if (totalOpen > 10) {
    insights.push(`⚠️ You have **${totalOpen}** open tasks - your workload is quite heavy.`);
  } else {
    insights.push(`📋 You have **${totalOpen}** open tasks.`);
  }

  // Insight about overdue tasks
  if (overdueCount > 0) {
    insights.push(`🚨 **${overdueCount}** task${overdueCount > 1 ? 's are' : ' is'} overdue and need${overdueCount === 1 ? 's' : ''} immediate attention!`);
  }

  // Insight about due soon
  if (dueSoonCount > 0) {
    insights.push(`⏰ **${dueSoonCount}** task${dueSoonCount > 1 ? 's are' : ' is'} due within the next 7 days.`);
  }

  // Insight about priority distribution
  const priorityCounts = {};
  priorityDistribution.forEach(p => {
    priorityCounts[p.priority] = p.count;
  });

  const highPriorityCount = priorityCounts['High'] || 0;
  const totalActiveTasks = Object.values(priorityCounts).reduce((a, b) => a + b, 0);

  if (highPriorityCount > 0 && totalActiveTasks > 0) {
    const highPriorityPercentage = Math.round((highPriorityCount / totalActiveTasks) * 100);
    if (highPriorityPercentage > 60) {
      insights.push(`🔥 **${highPriorityPercentage}%** of your active tasks are high priority. Consider focusing on these first.`);
    } else if (highPriorityCount > 0) {
      insights.push(`💡 You have **${highPriorityCount}** high priority task${highPriorityCount > 1 ? 's' : ''} to focus on.`);
    }
  }

  // Overall workload assessment
  if (totalOpen === 0 && overdueCount === 0) {
    insights.push("✨ Your task list is clear. Time to relax or take on new challenges!");
  } else if (overdueCount > 3 || (totalOpen > 15 && highPriorityCount > 5)) {
    insights.push("💪 Your workload is demanding. Consider prioritizing and breaking down complex tasks.");
  }

  return insights.join(' ');
}

module.exports = {
  getInsights
};