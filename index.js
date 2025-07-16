#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween.js';
import isoWeek from 'dayjs/plugin/isoWeek.js'; // Add isoWeek plugin
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import utc from 'dayjs/plugin/utc.js'; // Import UTC plugin
import customParseFormat from 'dayjs/plugin/customParseFormat.js'; // Import customParseFormat plugin
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));

dayjs.extend(isBetween);
dayjs.extend(isoWeek);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(utc); // Extend with UTC plugin
dayjs.extend(customParseFormat); // Extend with customParseFormat plugin

const program = new Command();
const DB_FILE = path.join(process.cwd(), 'schedule.json');

// Helper functions for file I/O
async function readDB() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { schedules: [] };
    } else {
      throw error;
    }
  }
}

async function writeDB(data) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

program
  .name('jcal')
  .description('A CLI tool to manage schedules and to-do lists.')
  .version(pkg.version);

program
  .command('init')
  .description('Creates an empty schedule.json file if it doesn\'t exist.')
  .action(async () => {
    try {
      const db = await readDB();
      if (db.schedules.length === 0) {
        await writeDB({ schedules: [] });
        console.log(chalk.green('✅ schedule.json created successfully.'));
      } else {
        console.log(chalk.yellow('⚠️ schedule.json already exists and is not empty.'));
      }
    } catch (error) {
      console.error(chalk.red(`❌ Error creating schedule.json: ${error.message}`));
    }
  });

program
  .command('add <titles...>').description('Adds one or more new schedules. Default to todo type, use -d for detailed.').option('-d, --detailed', 'Create a detailed schedule').option('-t, --time <time>', 'Specify time for detailed schedule (e.g., "Tomorrow 3pm")').option('-c, --content <content>', 'Specify content for detailed schedule').action(async (titles, options) => {
    try {
      const db = await readDB();
      const addedSchedules = [];

      for (const title of titles) {
        const newSchedule = {
          id: uuidv4().substring(0, 8),
          title,
          status: 'pending',
          createdAt: dayjs().toISOString(),
        };

        if (options.detailed) {
          newSchedule.type = 'detailed';
          let { time, content } = options;

          if (!time || !content) {
            console.error(chalk.red(`❌ Error: For detailed schedules, --time and --content are required when adding multiple items. Skipping "${title}".`));
            continue; // Skip this schedule and proceed to the next
          }
          newSchedule.dateTime = dayjs.utc(time, 'YYYY-MM-DD HH:mm').toISOString();
          newSchedule.content = content;
        } else {
          newSchedule.type = 'todo';
        }

        db.schedules.push(newSchedule);
        addedSchedules.push(newSchedule);
      }

      await writeDB(db);

      if (addedSchedules.length > 0) {
        console.log(chalk.green('✅ Schedules added successfully!'));
        addedSchedules.forEach(s => {
          console.log(chalk.green(`  - "${s.title}" (ID: ${s.id})`));
        });
      } else {
        console.log(chalk.yellow('No schedules were added.'));
      }

    } catch (error) {
      console.error(chalk.red(`❌ Error adding schedule: ${error.message}`));
    }
  });

program
  .command('list')
  .alias('ls')
  .description('Lists all schedules.')
  .option('--done', 'Show only done items')
  .option('--all', 'Show all items (pending and done)')
  .option('--date <date>', 'Show schedules for a specific date (YYYY-MM-DD)')
  .option('--today', 'Show schedules for today')
  .option('--tomorrow', 'Show schedules for tomorrow')
  .option('--this-week', 'Show schedules for this week')
  .option('--next-week', 'Show schedules for next week')
  .option('--this-month', 'Show schedules for this month')
  .option('--next-month', 'Show schedules for next month')
  .action(async (options) => {
    console.log('Options received:', options); // Debugging line
    try {
      const db = await readDB();
      let schedulesToDisplay = db.schedules;

      // Filter by status
      if (options.done) {
        schedulesToDisplay = schedulesToDisplay.filter(s => s.status === 'done');
      } else if (!options.all) {
        schedulesToDisplay = schedulesToDisplay.filter(s => s.status === 'pending');
      }

      // Filter by date/time
      if (options.date || options.today || options.tomorrow || options.thisWeek || options.nextWeek || options.thisMonth || options.nextMonth) {
        const now = dayjs().utc(); // Use UTC for current time
        schedulesToDisplay = schedulesToDisplay.filter(s => {
          if (s.type !== 'detailed' || !s.dateTime) return false; // Only detailed schedules with dateTime can be filtered by date

          const scheduleDate = dayjs(s.dateTime).utc(); // Parse stored date as UTC

          if (options.date) {
            const targetDate = dayjs.utc(options.date, 'YYYY-MM-DD');
            return scheduleDate.startOf('day').isSame(targetDate.startOf('day'));
          } else if (options.today) {
            return scheduleDate.startOf('day').isSame(now.startOf('day'));
          } else if (options.tomorrow) {
            return scheduleDate.startOf('day').isSame(now.add(1, 'day').startOf('day'));
          } else if (options.thisWeek) {
            return scheduleDate.startOf('day').isBetween(now.startOf('isoWeek').startOf('day'), now.endOf('isoWeek').endOf('day'), null, '[]');
          } else if (options.nextWeek) {
            return scheduleDate.startOf('day').isBetween(now.add(1, 'week').startOf('isoWeek').startOf('day'), now.add(1, 'week').endOf('isoWeek').endOf('day'), null, '[]');
          } else if (options.thisMonth) {
            return scheduleDate.startOf('day').isSame(now.startOf('month'), 'month');
          } else if (options.nextMonth) {
            return scheduleDate.startOf('day').isSame(now.add(1, 'month').startOf('month'), 'month');
          }
          return false; // No date filter matched, so exclude this schedule
        });
      }

      if (schedulesToDisplay.length === 0) {
        console.log(chalk.blue('No schedules to display.'));
        return;
      }

      // Sort schedules by creation date (newest first)
      schedulesToDisplay.sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)));

      schedulesToDisplay.forEach(schedule => {
        let statusIcon = '';
        let coloredOutput;

        if (schedule.status === 'done') {
          statusIcon = chalk.green('✔');
          coloredOutput = chalk.gray;
        } else {
          statusIcon = chalk.yellow('○');
          coloredOutput = chalk.yellow;
        }

        let typeColor;
        if (schedule.type === 'todo') {
          typeColor = chalk.cyan;
        } else {
          typeColor = chalk.magenta;
        }

        let output = `${statusIcon} ${typeColor(schedule.type.toUpperCase())} [${chalk.white(schedule.id)}] ${chalk.bold(schedule.title)}`;

        if (schedule.type === 'detailed') {
          output += `\n  ${chalk.blue('Time:')} ${schedule.dateTime}`;
          output += `\n  ${chalk.blue('Content:')} ${schedule.content}`;
        }
        output += `\n  ${chalk.blue('Created:')} ${dayjs(schedule.createdAt).format('YYYY-MM-DD HH:mm')}`;

        if (schedule.status === 'done') {
          console.log(chalk.strikethrough(output));
        } else {
          console.log(output);
        }
        console.log(''); // Add an empty line for better separation
      });
    } catch (error) {
      console.error(chalk.red(`❌ Error listing schedules: ${error.message}`));
    }
  });

program
  .command('done <id>')
  .description('Marks the schedule with the given <id> as done.')
  .action(async (id) => {
    try {
      const db = await readDB();
      const schedule = db.schedules.find(s => s.id === id);
      if (schedule) {
        schedule.status = 'done';
        await writeDB(db);
        console.log(chalk.green('✅ Schedule marked as done.'));
      } else {
        console.error(chalk.red('❌ Error: Schedule with that ID not found.'));
      }
    } catch (error) {
      console.error(chalk.red(`❌ Error updating schedule: ${error.message}`));
    }
  });

program
  .command('remove <id>')
  .alias('rm')
  .description('Deletes the schedule with the given <id>.')
  .action(async (id) => {
    try {
      const db = await readDB();
      const initialLength = db.schedules.length;
      db.schedules = db.schedules.filter(s => s.id !== id);
      if (db.schedules.length < initialLength) {
        await writeDB(db);
        console.log(chalk.green('✅ Schedule removed successfully.'));
      } else {
        console.error(chalk.red('❌ Error: Schedule with that ID not found.'));
      }
    } catch (error) {
      console.error(chalk.red(`❌ Error removing schedule: ${error.message}`));
    }
  });

program
  .command('update <id>')
  .description('Updates an existing schedule.')
  .option('-T, --title <title>', 'Update the title')
  .option('-t, --time <time>', 'Update the date/time')
  .option('-c, --content <content>', 'Update the content')
  .action(async (id, options) => {
    try {
      const db = await readDB();
      const schedule = db.schedules.find(s => s.id === id);
      if (schedule) {
        if (options.title) schedule.title = options.title;
        if (options.time) {
          if (schedule.type === 'detailed') {
            schedule.dateTime = dayjs.utc(options.time, 'YYYY-MM-DD HH:mm').toISOString();
          } else {
            console.warn(chalk.yellow('⚠️ Warning: Cannot set time on a todo item.'));
          }
        }
        if (options.content) {
          if (schedule.type === 'detailed') {
            schedule.content = options.content;
          } else {
            console.warn(chalk.yellow('⚠️ Warning: Cannot set content on a todo item.'));
          }
        }
        await writeDB(db);
        console.log(chalk.green('✅ Schedule updated successfully.'));
      } else {
        console.error(chalk.red('❌ Error: Schedule with that ID not found.'));
      }
    } catch (error) {
      console.error(chalk.red(`❌ Error updating schedule: ${error.message}`));
    }
  });

program.parse(process.argv);
