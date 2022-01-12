#include "Camera.hpp"

namespace gps {

    //Camera constructor
    Camera::Camera(glm::vec3 cameraPosition, glm::vec3 cameraTarget, glm::vec3 cameraUp) {
        this->cameraPosition = cameraPosition;
        this->cameraTarget = cameraTarget;
        this->cameraUpDirection = cameraUp;

        //TODO - Update the rest of camera parameters

        this->cameraFrontDirection = glm::normalize(-this->cameraPosition + this->cameraTarget);
        this->cameraRightDirection = glm::normalize(glm::cross(glm::vec3(0.0f, 0.0f, -1.0f), cameraUp));
        this->cameraUpDirection = glm::cross(this->cameraFrontDirection, this->cameraRightDirection);
    }

    //return the view matrix, using the glm::lookAt() function
    glm::mat4 Camera::getViewMatrix() {
        return glm::lookAt(this->cameraPosition, this->cameraPosition + this->cameraFrontDirection, glm::vec3(0.0, 1.0, 0.0));
    }

    //update the camera internal parameters following a camera move event
    void Camera::move(MOVE_DIRECTION direction, float speed) {
        //TODO

        if (direction == MOVE_FORWARD)
            this->cameraPosition += this->cameraFrontDirection * speed;
        if (direction == MOVE_BACKWARD)
            this->cameraPosition -= this->cameraFrontDirection * speed;
        if (direction == MOVE_LEFT)
            this->cameraPosition -= this->cameraRightDirection * speed;
        if (direction == MOVE_RIGHT)
            this->cameraPosition += this->cameraRightDirection * speed;
    }

    //update the camera internal parameters following a camera rotate event
    //yaw - camera rotation around the y axis
    //pitch - camera rotation around the x axis
    void Camera::rotate(float pitch, float yaw) {
        //TODO

        if (pitch > 89.0f)
            pitch = 89.0f;
        if (pitch < -89.0f)
            pitch = -89.0f;

        glm::vec3 newFrontDirection;
        newFrontDirection.x = cos(glm::radians(yaw)) * cos(glm::radians(pitch));
        newFrontDirection.y = sin(glm::radians(pitch));
        newFrontDirection.z = sin(glm::radians(yaw)) * cos(glm::radians(pitch));

        this->cameraFrontDirection = glm::normalize(newFrontDirection);
        this->cameraRightDirection = glm::normalize(glm::cross(this->cameraFrontDirection, glm::vec3(0.0f, 1.0f, 0.0f))); 
        this->cameraUpDirection = glm::normalize(glm::cross(this->cameraRightDirection, this->cameraFrontDirection));
    }
}