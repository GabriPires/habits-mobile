import { useCallback, useState } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Text, View, ScrollView, Alert } from 'react-native';

import { api } from '../lib/axios';
import { HabitDay, DAY_SIZE } from '../components/HabitDay';
import { Header } from '../components/Header';
import { generateDatesFromYearBeginning } from '../utils/generate-dates-from-year-beginning';
import { Loading } from '../components/Loading';
import dayjs from 'dayjs';

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const datesFromYearStart = generateDatesFromYearBeginning();
const minimumSummaryDatesDizes = 18 * 5;
const amountOfDaysToFill = minimumSummaryDatesDizes - datesFromYearStart.length;

type Summary = {
  id: string;
  date: string;
  amount: number;
  completed: number;
};

export const Home = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary[] | null>(null);

  const { navigate } = useNavigation();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/summary');
      setSummary(response.data);
    } catch (error) {
      Alert.alert('Ops', 'Não foi possível carregar o sumário de hábitos');
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <Header />

      <View className="flex-row mt-6 mb-2">
        {weekDays.map((weekDay, index) => (
          <Text
            key={`${weekDay}-${index}`}
            className={'text-zinc-400 text-xl font-bold text-center mx-1'}
            style={{ width: DAY_SIZE, height: DAY_SIZE }}
          >
            {weekDay}
          </Text>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {summary && (
          <View className="flex-row flex-wrap">
            {datesFromYearStart.map((date) => {
              const dayWithHabits = summary.find((day) =>
                dayjs(date).isSame(day.date, 'day'),
              );

              return (
                <HabitDay
                  key={date.toISOString()}
                  date={date}
                  amountOfHabits={dayWithHabits?.amount}
                  completedHabits={dayWithHabits?.completed}
                  onPress={() =>
                    navigate('habit', { date: date.toISOString() })
                  }
                />
              );
            })}

            {amountOfDaysToFill > 0 &&
              Array.from({ length: amountOfDaysToFill }).map((_, index) => (
                <View
                  key={index}
                  className="bg-zinc-900 rounded-lg  m-1 border-2 border-zinc-800 opacity-40"
                  style={{ width: DAY_SIZE, height: DAY_SIZE }}
                />
              ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};
