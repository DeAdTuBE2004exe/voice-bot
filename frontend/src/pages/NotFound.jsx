import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Row className="w-100 justify-content-center">
        <Col xs={12} md={8} className="text-center">
          <h1 style={{ fontSize: '4rem', color: '#185a9d' }}>404</h1>
          <h2 className="mb-4" style={{ color: '#222' }}>Page Not Found</h2>
          <p className="mb-4">Sorry, the page you are looking for does not exist.</p>
          <Button as={Link} to="/" variant="primary" size="lg">
            Go to Home
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;
