import { addNotification } from "../helpers/notificationHelper.js";

export const processWriterPayroll = (gameState, studio) => {
  const ownedWriters = gameState.ownedWriters || [];

  if (ownedWriters.length === 0) {
    return;
  }

  const totalPayroll = ownedWriters.reduce(
    (total, writer) => total + Number(writer.salary || 0),
    0
  );

  if (totalPayroll <= 0) {
    return;
  }

  const availableMoney = Number(studio.money || 0);

  if (availableMoney < totalPayroll) {
    addNotification(
      gameState,
      `Studio cannot afford weekly writer salaries. Required ₹${totalPayroll.toLocaleString()}, available ₹${availableMoney.toLocaleString()}.`
    );
  }

  const payrollCoverage = Math.min(1, availableMoney / totalPayroll);

  ownedWriters.forEach((writer) => {
    const paidSalary = Math.floor(Number(writer.salary || 0) * payrollCoverage);

    writer.totalEarnings = Number(writer.totalEarnings || 0) + paidSalary;
  });

  studio.money = Math.max(0, availableMoney - totalPayroll);
};
