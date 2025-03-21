import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";

import { createTestmailForDomainOptions } from "../../client/@tanstack/react-query.gen";

const useCreateTestMail = (clickedItem, domain) => {
  const [shouldFetch, setShouldFetch] = useState(false);

  const {
    data,
    isSuccess,
    isError,
    error: errorLogin,
  } = useQuery({
    ...createTestmailForDomainOptions({
      query: { server: clickedItem?.host, maildomain: domain },
    }),
    queryKey: ["testMailLoginLink", domain],
    enabled: shouldFetch && !!clickedItem,
    refetchOnWindowFocus: false,
    retry: 0,
    staleTime: 5 * (60 * 1000), // 5 mins
  });
  const toast = useToast();

  useEffect(() => {
    if (isSuccess && data) {
      const toastId = toast({
        title: `Mailbox is ready. Password is ${data.password}`,
        description: (
          <div>
            <a
              href={data.login_link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                navigator.clipboard.writeText(data.password);
                toast.close(toastId);
              }}
              style={{ color: "blue", textDecoration: "underline" }}
            >
              Click to open webmail and copy password.
            </a>
          </div>
        ),
        status: "success",
        duration: null,
        isClosable: true,
      });
    }
  }, [isSuccess, data, toast]);

  useEffect(() => {
    if (isError) {
      toast({
        title: "Error",
        description: `Failed to fetch webmail login link: ${errorLogin.message}`,
        status: "error",
      });
    }
  }, [isError, errorLogin, toast]);

  return { fetch: () => {setShouldFetch(true);} };
};

export default useCreateTestMail;
