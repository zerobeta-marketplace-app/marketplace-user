import { Module } from '@nestjs/common';
import { UserProducerService } from './producer.service';

@Module({
  providers: [UserProducerService],
  exports: [UserProducerService],
})
export class KafkaModule {}