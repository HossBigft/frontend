import {
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";

import { type UserCreate } from "../../client";
import useCustomToast from "../../hooks/useCustomToast";
import { emailPattern, handleError } from "../../utils";
import { createUserMutation } from "../../client/@tanstack/react-query.gen";

interface AddUserProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserCreateForm extends UserCreate {
  confirm_password: string;
  is_superuser: boolean;
  is_admin: boolean;
}

const AddUser = ({ isOpen, onClose }: AddUserProps) => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<UserCreateForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      ssh_username: "",
      email: "",
      full_name: "",
      password: "",
      confirm_password: "",
      role: "user",
      is_active: false,
    },
  });

  const mutation = useMutation({
    ...createUserMutation(),
    onSuccess: () => {
      showToast("Success!", "User created successfully.", "success");
      reset();
      onClose();
    },
    onError: (err) => {
      handleError(err, showToast);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const onSubmit: SubmitHandler<UserCreateForm> = (data: UserCreateForm) => {
    if (data.is_superuser) {
      data.role = "superuser";
    } else if (data.is_admin) {
      data.role = "admin";
    }
    mutation.mutate({ body: data });
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: "sm", md: "md" }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Add User</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
          <FormControl mt={4} isInvalid={!!errors.full_name}>
              <FormLabel htmlFor="ssh_username">SSH username on Plesk Servers</FormLabel>
              <Input
                id="ssh_username"
                {...register("ssh_username")}
                placeholder="SSH username on Plesk Servers"
                type="text"
              />
              {errors.full_name && (
                <FormErrorMessage>{errors.full_name.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl isRequired isInvalid={!!errors.email}>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                id="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: emailPattern,
                })}
                placeholder="Email"
                type="email"
              />
              {errors.email && (
                <FormErrorMessage>{errors.email.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl mt={4} isInvalid={!!errors.full_name}>
              <FormLabel htmlFor="name">Full name</FormLabel>
              <Input
                id="name"
                {...register("full_name")}
                placeholder="Full name"
                type="text"
              />
              {errors.full_name && (
                <FormErrorMessage>{errors.full_name.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl mt={4} isRequired isInvalid={!!errors.password}>
              <FormLabel htmlFor="password">Set Password</FormLabel>
              <Input
                id="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                placeholder="Password"
                type="password"
              />
              {errors.password && (
                <FormErrorMessage>{errors.password.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl
              mt={4}
              isRequired
              isInvalid={!!errors.confirm_password}
            >
              <FormLabel htmlFor="confirm_password">Confirm Password</FormLabel>
              <Input
                id="confirm_password"
                {...register("confirm_password", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === getValues().password ||
                    "The passwords do not match",
                })}
                placeholder="Password"
                type="password"
              />
              {errors.confirm_password && (
                <FormErrorMessage>
                  {errors.confirm_password.message}
                </FormErrorMessage>
              )}
            </FormControl>
            <Flex mt={4}>
              <FormControl>
                <Checkbox {...register("is_superuser")} colorScheme="teal">
                  Is superuser?
                </Checkbox>
              </FormControl>
              <FormControl>
                <Checkbox {...register("is_active")} colorScheme="teal">
                  Is active?
                </Checkbox>
                <FormControl>
                  <Checkbox {...register("is_admin")} colorScheme="teal">
                    Is admin?
                  </Checkbox>
                </FormControl>
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddUser;
