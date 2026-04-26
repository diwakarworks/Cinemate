import { Button, Container, Group, Text, Title } from '@mantine/core';
import classes from './NotFoundTitle.module.css';
import {Link} from "react-router-dom";

const  NotFoundTitle =()  => {
  return (
    <div className="min-h-screen bg-white">
    <Container className={classes.root}>
      <div className={classes.label}>404</div>
      <Title className={classes.title}>You have found a secret place.</Title>
      <Text c="dimmed" size="lg" ta="center" className={classes.description}>
        Unfortunately, this is only a 404 page. You may have mistyped the address, or the page has
        been moved to another URL.
      </Text>
      <Group justify="center">
        <div className="flex justify-center">
        <Link to ={'/'} >
        <Button className="text-blue-500  hover:bg-blue-100 w-34 h-34 font-semibold  mt-20" size="md">
          Take me back to home page
        </Button>
        </Link>
        </div>
      </Group>
    </Container>
    </div>
  );
}

export default NotFoundTitle;