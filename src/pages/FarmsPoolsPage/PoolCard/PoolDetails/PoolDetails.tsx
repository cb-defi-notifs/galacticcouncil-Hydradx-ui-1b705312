import { Box } from "components/Box/Box";
import { Separator } from "components/Separator/Separator";
import { Text } from "components/Typography/Text/Text";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { PoolsIcons } from "./PoolsIcons/PoolsIcons";

type PoolDetailsProps = {};

const data = { title: "XYK Pool" };

export const PoolDetails: FC<PoolDetailsProps> = () => {
  const { t } = useTranslation();

  return (
    <Box flex column width={380}>
      <Box flex spread mb={40} ml={4}>
        <Box>
          <Text fs={14} lh={26} color="neutralGray400">
            {data.title}
          </Text>
          <Box flex>
            <PoolsIcons />
          </Box>
        </Box>
        <Box flex column width={120} mt={5} align="start">
          <Text fs={14} color="neutralGray400" lh={22}>
            {t("farmsPoolsPage.poolCard.poolDetails.fee")}
          </Text>
          <Text lh={22} color="white">
            0.3%
          </Text>
        </Box>
      </Box>
      <Separator mb={34} />
      <Box flex spread ml={4} mb={36}>
        <Box>
          <Text fs={14} color="neutralGray400" lh={22}>
            {t("farmsPoolsPage.poolCard.poolDetails.valueLocked")}
          </Text>
          <Text lh={22} color="white">
            $100000000
          </Text>
        </Box>
        <Box flex column width={120} align="start">
          <Text fs={14} color="neutralGray400" lh={22}>
            {t("farmsPoolsPage.poolCard.poolDetails.24hours")}
          </Text>
          <Text lh={22} color="white">
            $12300.45
          </Text>
        </Box>
      </Box>
    </Box>
  );
};
