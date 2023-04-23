import { Badge } from "@chakra-ui/react";
import { TaskStatus } from "@prisma/client";

interface TaskStatusIndicatorProps {
  status: TaskStatus;
}

const TaskStatusIndicator = ({ status }: TaskStatusIndicatorProps) => {
  if (status === TaskStatus.COMPLETED) {
    return <Badge colorScheme="green">Completado</Badge>;
  } else if (status.toString() === TaskStatus.SUBMITTED) {
    return <Badge colorScheme="purple">Submetido</Badge>;
  } else return <Badge colorScheme="red">Pendente</Badge>;
};

export default TaskStatusIndicator;
